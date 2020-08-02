const Settings = require("../models/settings");

class ClientInfo {
  constructor() {
    const clientInfoConfig = Settings.getSettings("aramex", "client_info_");
    this.data = {
      UserName: clientInfoConfig.client_info_userName,
      Password: clientInfoConfig.client_info_password,
      Version: clientInfoConfig.client_info_version,
      AccountNumber: clientInfoConfig.client_info_accountNumber,
      AccountPin: clientInfoConfig.client_info_accountPin,
      AccountEntity: clientInfoConfig.client_info_accountEntity,
      AccountCountryCode: clientInfoConfig.client_info_AccountCountryCode,
    };
  }

  get() {
    return this.data;
  }
}

class Address {
  constructor() {
    this.data = {};
  }
  getAddress() {
    return this.data;
  }
}

class OriginAddress extends Address {
  constructor() {
    const originAddressInfo = Settings.getSettings("aramex", "origin_address_");
    super();
    this.data = {
      Line1: originAddressInfo.origin_address_line1,
      Line2: originAddressInfo.origin_address_line2,
      Line3: originAddressInfo.origin_address_line3,
      City: originAddressInfo.origin_address_city,
      StateOrProvinceCode: originAddressInfo.origin_address_stateOrProvinceCode,
      PostCode: originAddressInfo.origin_address_postCode,
      CountryCode: originAddressInfo.origin_address_countryCode,
    };
  }
}

class DestinationAddress extends Address {
  constructor(
    Line1 = "",
    Line2 = "",
    Line3 = "",
    City = "",
    StateOrProvinceCode = "",
    PostCode = "",
    CountryCode = ""
  ) {
    super();
    this.data = {
      Line1,
      Line2,
      Line3,
      City,
      StateOrProvinceCode,
      PostCode,
      CountryCode,
    };
  }
}

class Aramex {
  constructor() {
    this.client = new ClientInfo();
  }
}

module.exports = new Aramex();
