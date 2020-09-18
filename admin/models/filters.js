const db = require("../../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const { i18next } = require("../../i18next");

exports.getParentFilters = async (data) => {
  const { q, page, perPage, sort, direction, expand } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;

  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status, fd.title
  from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.parent_id ='0' AND fd.language = '${reqLanguage}' AND fd.title LIKE '%${q}%'
  `;

  let sorter = "f";
  if (sort === "title") {
    sorter = "fd";
  }
  sql += ` ORDER BY ${sorter}.${sort} ${direction}`;

  if (expand) {
    //Add limit & pagination only in expand mode
    sql += ` LIMIT ${_start}, ${_limit}`;
  }

  const [filters, fields] = await db.query(sql);

  return filters;
};

exports.getChildFilters = async (parent_id) => {
  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status, fd.title
  from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.parent_id ='${parent_id}' AND fd.language = '${reqLanguage}'
  `;
  const [filters, fields] = await db.query(sql);

  return filters;
};

exports.getTotalFilters = async (data) => {
  const { q } = data;

  let sql = `SELECT COUNT(*) AS total from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.parent_id ='0' AND fd.language = '${reqLanguage}' AND fd.title LIKE '%${q}%'
  `;

  const [totals, fields] = await db.query(sql);
  const { total } = totals[0];
  return total;
};

exports.getFilter = async (filter_id, withChildren = true) => {
  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status, fd.title
  from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.filter_id ='${filter_id}' AND fd.language = '${reqLanguage}'
  `;
  const [query, fields] = await db.query(sql);

  let filter;
  let parent;
  let children;
  if (query.length && withChildren) {
    parent = query[0];
    children = await this.getChildFilters(filter_id);
  }

  filter = {
    ...parent,
    children,
  };

  return filter;
};

exports.addFilter = withTransaction(async (transaction, body) => {
  const description = [...body.description];
  delete body.description;

  const [filter, _] = await transaction.query(`INSERT INTO filter SET ?`, {
    ...body,
  });

  if (description) {
    for (const desc of description) {
      await transaction.query(`INSERT INTO filter_description SET ?`, {
        filter_id: filter.insertId,
        ...desc,
      });
    }
  }
  await transaction.commit();
  return this.getFilter(filter.insertId);
});

exports.updateFilter = withTransaction(async (transaction, data) => {
  const description = [...data.description];
  const filter_id = data.id;
  delete data.description;
  delete data.id;

  const [filter, _] = await transaction.query(
    `UPDATE filter SET ? WHERE filter_id = '${filter_id}'`,
    {
      ...data,
      date_modified: new Date(),
    }
  );

  if (!filter.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: filter_id })
    );
  }

  if (description) {
    for (const desc of description) {
      await transaction.query(`REPLACE INTO filter_description SET ? `, {
        filter_id: filter_id,
        language: desc.language,
        ...desc,
      });
    }
  }

  await transaction.commit();

  return this.getFilter(filter_id);
});

exports.deleteFilter = async (filter_id) => {
  const [filter, _s] = await db.query(
    `DELETE FROM filter WHERE filter_id = '${filter_id}'`
  );

  if (!filter.affectedRows) {
    throw new ErrorResponse(
      404,
      i18next.t("common:not_found", { id: filter_id })
    );
  }

  const [children, _c] = await db.query(
    `DELETE FROM filter WHERE parent_id = '${filter_id}'`
  );

  return +filter_id;
};

exports.getAllRaw = async (q) => {
  const query = q || "";

  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status, fd.title, dparent.title AS parent
  from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  LEFT JOIN filter fparent ON(fparent.filter_id = f.parent_id)
  LEFT JOIN filter_description dparent ON(fparent.filter_id = dparent.filter_id AND dparent.language = '${reqLanguage}')
  WHERE fd.language = '${reqLanguage}' AND fd.title LIKE '%${query}%'
  ORDER BY CASE WHEN f.parent_id = 0 THEN f.filter_id ELSE f.parent_id END, f.parent_id, f.filter_id`;

  const [filters, _c] = await db.query(sql);

  const divider = ">";
  for (const fil of filters) {
    if (fil.parent) {
      fil.title = `${fil.parent} ${divider} ${fil.title}`;
    }
  }

  return filters;
};

exports.getFilterForEdit = async (filter_id) => {
  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status,
  CONCAT(
  '[',
    GROUP_CONCAT(
      DISTINCT
      JSON_OBJECT("language", fd.language, "title", fd.title)
      )
  ,']'
  )
  AS description
  FROM filter f
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.filter_id ='${filter_id}'
  `;

  const [filter, fields] = await db.query(sql);

  let result = filter[0];
  if (result && result.filter_id) {
    result.description = JSON.parse(result.description);
  } else {
    result = null;
  }

  return result;
};

exports.switchStatus = async (filter_id, status) => {
  await db.query(`UPDATE filter SET ? WHERE filter_id = '${filter_id}'`, {
    status: status,
  });

  return status;
};
