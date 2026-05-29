import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://enterprise-keycloak.onrender.com",
  realm: "enterprise-lab",
  clientId: "enterprise-chatbot",
});

export default keycloak;