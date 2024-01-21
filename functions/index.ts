import { app } from "@azure/functions";
import { recent } from "./recent";

app.http("recent", {
  methods: ["PUT"],
  authLevel: "function",
  handler: recent,
});
