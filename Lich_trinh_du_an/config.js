/* Google sign-in setup:
   1. console.cloud.google.com -> create a project
   2. enable "Google Drive API"
   3. OAuth consent screen -> External -> add yourself as a test user
   4. Credentials -> OAuth client ID -> Web application
      Authorized JavaScript origin: http://localhost:8080
   5. Paste the client ID between the quotes below, then reload.
   Leave it empty to keep using the app in local-only mode. */
window.APP_CONFIG = {
  googleClientId: ""
};
