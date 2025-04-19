"use client";
import { Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import FormWrapper from "../../components/forms/FormWrapper";
import { useState, useEffect } from "react";
import { removeItemFromArray } from "../../utils/generalUtils";
import FormErrors from "../../components/forms/FormErrors";
import stylesFormWrapper from "../../components/forms/FormWrapper.module.css";

function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const email = useSearchParams().get("email");

  const [isTokenValid, setIsTokenValid] = useState(0);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formPassErrors, setPassErrors] = useState<string[]>([]);

  const [actionResult, setActionResult] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function checkToken() {
      try {
        const response = await fetch("/api/auth/checkresettoken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            token: token,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsTokenValid(data.tokenState);
        } else {
          console.error("Error in database response:", data);
          setIsTokenValid(-1);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setIsTokenValid(-1);
      }
    }

    if (email && token) {
      checkToken();
    }
  }, []);

  useEffect(() => {
    if (actionResult) {
      const timer = setTimeout(() => {
        window.location.replace("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionResult]);

  useEffect(() => {
    let errors = [...formPassErrors];

    if (password.trim() === "" && !errors.includes("Password is empty")) {
      errors.push("Password is empty");
    }
    if (password.trim() !== "" && errors.includes("Password is empty")) {
      errors = removeItemFromArray(errors, "Password is empty");
    }

    if (
      password2.trim() !== password.trim() &&
      !errors.includes("Passwords do not match")
    ) {
      errors.push("Passwords do not match");
    }
    if (
      password2.trim() === password.trim() &&
      errors.includes("Passwords do not match")
    ) {
      errors = removeItemFromArray(errors, "Passwords do not match");
    }

    setPassErrors(errors);
  }, [password, password2]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (formPassErrors.length !== 0) {
      console.log(formPassErrors);
      return;
    }

    if (isTokenValid !== 1) {
      console.log("bad token");
      return;
    }

    let response = await fetch("/api/auth/resethandling", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callbackUrl: "/",
        email: email,
        password: password,
      }),
    });

    let baseResponse = await response.json();

    if (response.ok) {
      if (baseResponse.resetHandlingState === true) {
        console.log(baseResponse.message);
        setActionMessage(baseResponse.message);
        setActionResult(true);
      } else {
        console.log(baseResponse.message);
        setActionMessage(baseResponse.message);
        setActionResult(false);
      }
    } else {
      throw new Error("error in database response");
    }
  }

  return (
    <main>
      {isTokenValid === 0 && (
        <FormWrapper formName="Checking resetting link..." isFormOpen={true}>
          <form id="resetForm" className="verticalForm">
            <div className="tableTitle">Checking reset link...</div>
          </form>
        </FormWrapper>
      )}
      {isTokenValid === -1 && (
        <FormWrapper formName="Password Reset Link Expired" isFormOpen={true}>
          <form id="resetForm" className="verticalForm">
            <div className="tableTitle">Password reset link is invalid</div>
          </form>
        </FormWrapper>
      )}
      {isTokenValid === 1 && (
        <FormWrapper formName="Enter new password" isFormOpen={true}>
          <form id="resetForm" className="verticalForm" onSubmit={handleSubmit}>
            <div className="tableTitle">Password reset</div>
            <div
              className={
                actionResult
                  ? stylesFormWrapper.actionSuccess
                  : stylesFormWrapper.actionFail
              }
            >
              {actionMessage}
            </div>

            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mainInput"
            />
            <input
              type="password"
              placeholder="confirm password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="mainInput"
            />
            <FormErrors formErrors={formPassErrors} />
            <button id="resetButton" className="mainButton" type="submit">
              Set new password
            </button>
          </form>
        </FormWrapper>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
