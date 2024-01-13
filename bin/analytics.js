export async function get() {
  const response = await fetch("http://localhost:3000/pcg");
  const executions = await response.json();

  const totalCount = executions.reduce((count, item) => {
    return count + item.count;
  }, 0);
  return { executions, totalCount };
}

export async function post(email, name) {
  const response = await fetch("http://localhost:3000/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name }),
  });
  const reply = await response.json();
  console.log(reply);
}
