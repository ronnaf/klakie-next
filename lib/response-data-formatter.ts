import { ClockifyError } from "./models/clockify-error";
import { FailureData, SuccessData } from "./models/response-data";

export const ResponseDataFormatter = {
  success: <T>(data: T): SuccessData<T> => ({
    status: "success",
    data: data,
  }),
  failure: (error: ClockifyError): FailureData => ({
    status: "failure",
    data: error,
  }),
};
