import { PostgrestError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/http";

import { followError } from "./social";

function postgrestError(code: string) {
  return new PostgrestError({ message: "", details: "", hint: "", code });
}

describe("followError", () => {
  it("answers an unknown handle (no_data_found) with 404", () => {
    const error = followError(postgrestError("P0002"));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: "member_not_found" });
  });

  it("answers following yourself (invalid_parameter_value) with 400", () => {
    const error = followError(postgrestError("22023"));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: "cannot_follow_self" });
  });

  it("passes any other error through, so route() answers 500", () => {
    const error = postgrestError("42501");
    expect(followError(error)).toBe(error);
  });
});
