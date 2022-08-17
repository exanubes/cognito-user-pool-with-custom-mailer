import React, { FormEvent } from "react";
import { accessTokenKey } from "../App";

export function LogIn() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as unknown as {
      elements: HTMLInputElement[];
      reset(): void;
    };

    const [username, password] = form.elements;
    fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })
      .then((res) => res.json())
      .then((tokens) => {
        localStorage.setItem(accessTokenKey, tokens.AccessToken);
        return tokens;
      })
      .then(console.log);
    // .then(setComments);
    form.reset();
  };
  return (
    <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1">
      <label className="flex gap-4">
        <span className="w-[10rem] text-left">Username</span>
        <input className="border w-full py-1" placeholder="Johnny" />
      </label>
      <label className="flex gap-4">
        <span className="w-[10rem] text-left">Password</span>
        <input className="border w-full py-1" placeholder="@Password1" />
      </label>
      <button
        className="bg-[#1565c0aa] py-2 uppercase font-semibold text-white hover:bg-[#1565c0bb]"
        type="submit"
      >
        Log In
      </button>
    </form>
  );
}
