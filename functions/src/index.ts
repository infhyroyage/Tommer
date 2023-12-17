import { app } from "@azure/functions";
import { putUcsRecent } from "./putUcsRecent";

app.http("putUcsRecent", {
  methods: ["PUT"],
  authLevel: "admin",
  handler: putUcsRecent,
  route: "ucs-recent",
});
