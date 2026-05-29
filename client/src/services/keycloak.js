import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "enterprise-lab",
  clientId: "enterprise-chatbot",
});

export default keycloak;