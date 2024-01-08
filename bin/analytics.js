import { maskInfo } from "./utils.js";

export async function get() {
  const response = await fetch("http://localhost:3000/pcg");
  const executions = await response.json();
  const data = executions.map((item) => {
    let { email, name } = item;
    email = maskInfo(email);
    name = maskInfo(name);
    return { ...item, email, name };
  });
  const totalCount = data.reduce((count, item) => {
    return count + item.count;
  }, 0);
  return { data, totalCount };
}

export async function post(email, name) {
  const response = await fetch("http://localhost:3000/pcg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name }),
  });
  const reply = await response.json();
  console.log(reply);
}
