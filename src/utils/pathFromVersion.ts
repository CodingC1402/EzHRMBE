import {ApiVersion} from "../configurations/apiVersions"
import urlJoin from "url-join"

export default function getPathFromVersion(path: string, version: ApiVersion): string {
  return urlJoin("api", version, path);
}