import { ClockifyError } from "./clockify-error";

export type ResponseData<T> = SuccessData<T> | FailureData;

export interface SuccessData<T> {
  status: "success";
  data: T;
}

export interface FailureData {
  status: "failure";
  data: ClockifyError;
}
