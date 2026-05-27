import apiClient from "./Axios";

export async function getClientReports() {

  const response =
    await apiClient.get(
      "/reports/client"
    );

  return response.data;
}