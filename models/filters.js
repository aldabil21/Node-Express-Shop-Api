const db = require("../config/db");
const withTransaction = require("../helpers/withTransaction");
const ErrorResponse = require("../helpers/error");
const i18next = require("../i18next");

exports.getParentFilters = async (data) => {
  const { q, page, perPage, sort, direction, expand } = data;

  const _page = page > 0 ? page : 1;
  const _limit = perPage;
  const _start = (_page - 1) * _limit;

  let sql = `SELECT f.filter_id, f.parent_id, f.sort_order, f.status, fd.title
  from filter f 
  LEFT JOIN filter_description fd ON(f.filter_id = fd.filter_id)
  WHERE f.parent_id ='0' AND fd.language = '${reqLanguage}' AND fd.title LIKE '%${q}%'
  ORDER BY f.${sort} ${direction}`;

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
  const [filter, fields] = await db.query(sql);

  if (filter.length && withChildren) {
    this.getChildFilters(filter.filter_id);
  }

  return filter[0];
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

exports.updateFilter = withTransaction(async (transaction, body) => {
  const description = [...body.description];
  const filter_id = body.id;
  delete body.description;
  delete body.id;

  const [filter, _] = await transaction.query(
    `UPDATE filter SET ? WHERE filter_id = '${filter_id}'`,
    {
      ...body,
      date_modified: new Date(),
    }
  );

  if (!filter.affectedRows) {
    throw new ErrorResponse(404, "filter not found");
  }

  if (description) {
    for (const desc of description) {
      await transaction.query(
        `UPDATE filter_description SET ? WHERE filter_id = '${filter_id}' AND language = '${desc.language}'`,
        desc
      );
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

  return +filter_id;
};
