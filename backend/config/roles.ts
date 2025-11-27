import { AccessControl } from "accesscontrol";

const ac = new AccessControl();

ac.grant("customer").readAny("product").readAny("category").createOwn("order"); // Example

ac.grant("admin")
  .extend("customer") // Inherits customer rights
  .createAny("product")
  .updateAny("product")
  .deleteAny("product")
  .updateAny("inventory"); // For restocking

export default ac;
