import { ClockifyDetailedReport } from "../models/clockify-detailed-report";
import { ClockifyError } from "../models/clockify-error";
import { ClockifyUser } from "../models/clockify-user";
import { ClockifyWorkspace } from "../models/clockify-workspace";
import { ResponseData } from "../models/response-data";
import { ResponseDataFormatter } from "../response-data-formatter";

const CLOCKIFY_API_BASE_URL = "https://api.clockify.me/api";
const CLOCKIFY_REPORT_API_BASE_URL = "https://reports.api.clockify.me";

const apiErrors = {
  invalidApiKey: <ClockifyError>{
    code: 401,
    message: "Invalid API key",
  },
};

interface ClockifyApiService {
  getCurrentUser: (_: null, request: { apiKey: string }) => Promise<ResponseData<ClockifyUser>>;
  getCurrentWorkspaces: (_: null, request: { apiKey: string }) => Promise<ResponseData<ClockifyWorkspace[]>>;
  getDetailedReport: (
    payload: {
      workspaceId: string;
      range: { start: Date; end: Date };
    },
    request: { apiKey: string }
  ) => Promise<ResponseData<ClockifyDetailedReport>>;
}

export const clockifyApiService: ClockifyApiService = {
  getCurrentUser: async (_, request) => {
    try {
      const { apiKey } = request;
      if (!apiKey) {
        throw apiErrors.invalidApiKey;
      }

      const url = `${CLOCKIFY_API_BASE_URL}/v1/user`;
      const response = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      const user = await response.json();
      return ResponseDataFormatter.success(user);
    } catch (e) {
      const error = <ClockifyError>e;
      return ResponseDataFormatter.failure(error);
    }
  },
  getCurrentWorkspaces: async (_, request) => {
    try {
      const { apiKey } = request;
      if (!apiKey) {
        throw apiErrors.invalidApiKey;
      }

      const url = `${CLOCKIFY_API_BASE_URL}/v1/workspaces`;
      const response = await fetch(url, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      const workspaces = await response.json();
      return ResponseDataFormatter.success(workspaces);
    } catch (e) {
      const error = <ClockifyError>e;
      return ResponseDataFormatter.failure(error);
    }
  },
  getDetailedReport: async (payload, request) => {
    try {
      const { apiKey } = request;
      if (!apiKey) {
        throw apiErrors.invalidApiKey;
      }

      const url = `${CLOCKIFY_REPORT_API_BASE_URL}/workspaces/${payload.workspaceId}/reports/detailed`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountShown: "HIDE_AMOUNT",
          dateRangeStart: payload.range.start.toJSON(),
          dateRangeEnd: payload.range.end.toJSON(),
          detailedFilter: {
            options: { totals: "CALCULATE" },
            pageSize: 50,
            page: 1,
          },
        }),
      });

      const report = await response.json();
      return ResponseDataFormatter.success(report);
    } catch (e) {
      const error = <ClockifyError>e;
      return ResponseDataFormatter.failure(error);
    }
  },
};
