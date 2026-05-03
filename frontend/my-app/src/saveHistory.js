export function saveHistory(userId, module, inputData, resultData) {
  fetch(`${process.env.REACT_APP_API_URL}/api/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      module,
      input_data: inputData,
      result_data: resultData,
    }),
  }).catch(() => {});
}
