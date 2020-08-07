const soap = require("soap");
const path = require("path");
const Settings = require("../models/settings");

class ClientInfo {
  constructor() {
    const clientInfoConfig = Settings.getSettings("aramex", "client_info_");
    this.UserName = clientInfoConfig.client_info_userName;
    this.Password = clientInfoConfig.client_info_password;
    this.Version = clientInfoConfig.client_info_version;
    this.AccountNumber = clientInfoConfig.client_info_accountNumber;
    this.AccountPin = clientInfoConfig.client_info_accountPin;
    this.AccountEntity = clientInfoConfig.client_info_accountEntity;
    this.AccountCountryCode = clientInfoConfig.client_info_AccountCountryCode;
  }
}

class Address {
  constructor() {}

  setAddress(
    Line1 = "City Center",
    Line2 = "",
    Line3 = "",
    City = "unayzah",
    StateOrProvinceCode = "",
    PostCode = "",
    CountryCode = "SA"
  ) {
    this.Line1 = Line1;
    this.Line2 = Line2;
    this.Line3 = Line3;
    this.City = City;
    this.StateOrProvinceCode = StateOrProvinceCode;
    this.PostCode = PostCode;
    this.CountryCode = CountryCode;
  }
}

class OriginAddress extends Address {
  constructor() {
    const originAddressInfo = Settings.getSettings("aramex", "origin_address_");
    super();
    this.Line1 = originAddressInfo.origin_address_line1;
    this.Line2 = originAddressInfo.origin_address_line2;
    this.Line3 = originAddressInfo.origin_address_line3;
    this.City = originAddressInfo.origin_address_city;
    this.StateOrProvinceCode =
      originAddressInfo.origin_address_stateOrProvinceCode;
    this.PostCode = originAddressInfo.origin_address_postCode;
    this.CountryCode = originAddressInfo.origin_address_countryCode;
  }
}

class DestinationAddress extends Address {
  constructor(
    Line1 = "City Center",
    Line2 = "",
    Line3 = "",
    City = "unayzah",
    StateOrProvinceCode = "",
    PostCode = "",
    CountryCode = "SA"
  ) {
    super();
    this.Line1 = Line1;
    this.Line2 = Line2;
    this.Line3 = Line3;
    this.City = City;
    this.StateOrProvinceCode = StateOrProvinceCode;
    this.PostCode = PostCode;
    this.CountryCode = CountryCode;
  }
}

class Weight {
  constructor(unit, value) {
    this.Unit = unit || "KG";
    this.Value = value || 0.5;
  }

  set(unit, value) {
    this.Unit = unit;
    this.Value = value;
  }
}

class ShipmentDetails {
  constructor(
    weight,
    descriptionOfGoods,
    originCountry = "SA",
    destinationContryCode = "SA",
    numberOfPieces = 1,
    isCOD = false,
    isUrgent = false
  ) {
    const myCountry = Settings.getSetting(
      "aramex",
      "origin_address_countryCode"
    );
    const isDomestic =
      myCountry.origin_address_countryCode === destinationContryCode;

    this.Dimensions = null; //O
    this.ActualWeight = new Weight("KG", weight); //M
    this.ChargeableWeight = null; //?
    this.DescriptionOfGoods = descriptionOfGoods; //M
    this.GoodsOriginCountry = originCountry; //M
    this.NumberOfPieces = numberOfPieces;
    this.ProductGroup = isDomestic ? "DOM" : "EXP"; //M
    this.ProductType = isDomestic ? "OND" : isUrgent ? "PPX" : "PPX"; //M //TODO: why GPX is invalid
    this.PaymentType = isCOD ? "C" : "P"; //M
    this.PaymentOptions = isCOD ? "ASCC" : "ACCT"; //C
    // this.CustomsValueAmount = {};
    // this.CashOnDeliveryAmount = {};
    // this.InsuranceAmount = {};
    // this.CashAdditionalAmount = {};
    // this.CollectAmount = {};
    this.Services = isCOD ? "CODS" : "FIRST"; //O [CODS, FIRST, ...]
    this.Items = []; //O Array of ShipmentItems
  }
}

/**
 * Exports
 */
class RateCalculator {
  constructor() {
    this.client = new ClientInfo();
    this.originAddress = new OriginAddress();
    this.destinationAddress;
    this.shipmentDetail;
  }

  setDestination(destination) {
    this.destinationAddress = new DestinationAddress(
      destination.Line1,
      destination.Line2,
      destination.Line3,
      destination.destinationCity,
      destination.StateOrProvinceCode,
      destination.PostCode,
      destination.destinationContryCode
    );
  }

  setShipment(shipment) {
    this.shipmentDetail = new ShipmentDetails(
      shipment.weight,
      shipment.descriptionOfGoods,
      shipment.originCountry,
      shipment.destinationContryCode,
      shipment.numberOfPieces,
      shipment.isCOD,
      shipment.isUrgent
    );
  }
  async calculateRate({
    weight,
    descriptionOfGoods,
    originCountry,
    numberOfPieces,
    isCOD,
    isUrgent,
    destinationContryCode,
    destinationCity,
  }) {
    this.setShipment({
      weight,
      descriptionOfGoods,
      originCountry,
      destinationContryCode,
      numberOfPieces,
      isCOD,
      isUrgent,
    });
    this.setDestination({ destinationContryCode, destinationCity });
    const args = {
      ClientInfo: this.client,
      OriginAddress: this.originAddress,
      DestinationAddress: this.destinationAddress,
      ShipmentDetails: this.shipmentDetail,
    };

    try {
      // console.log(this.shipmentDetail);
      const client = await soap.createClientAsync(
        path.join(
          __dirname,
          "..",
          "aramex_wsdl",
          "dev-aramex-rates-calculator-wsdl.wsdl"
        )
      );
      return new Promise((resolve, reject) => {
        client.CalculateRate(args, (_, result) => {
          // console.log(result);
          if (result && result.HasErrors) {
            const err = {
              HasErrors: true,
              errors: result.Notifications.Notification,
            };
            resolve(err);
          }
          resolve(result);
        });
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = {
  calculator: new RateCalculator(),
};
