import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
} from "../utils/api";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("credentials");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =========================================================
     OTP COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (otpTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimeLeft]);

  /* =========================================================
     RESEND COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (resendTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimeLeft]);

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  /* =========================================================
     REQUEST OTP
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginUser(formData);

      setStep("otp");

      // OTP valid for 5 minutes
      setOtpTimeLeft(5 * 60);

      // Prevent immediate resend
      setResendTimeLeft(60);

      setSuccess(
        `A verification code has been sent to ${formData.email}`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  async function handleVerifyOtp(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyLoginOtp(
        formData.email,
        otp
      );

      login(data.token, data.user);

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RESEND OTP
  ========================================================= */

  async function handleResendOtp() {
    if (resendTimeLeft > 0 || loading) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await resendLoginOtp(formData.email);

      setOtp("");

      // New OTP gets another 5 minutes
      setOtpTimeLeft(5 * 60);

      // Start 60-second resend cooldown
      setResendTimeLeft(60);

      setSuccess(
        `A new verification code has been sent to ${formData.email}`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     BACK TO LOGIN
  ========================================================= */

  function handleBackToLogin() {
    setStep("credentials");
    setOtp("");
    setError("");
    setSuccess("");
    setOtpTimeLeft(0);
    setResendTimeLeft(0);
  }

  /* =========================================================
     OTP INPUT
  ========================================================= */

  function handleOtpChange(event) {
    const value = event.target.value;

    // Allow digits only
    const numericValue = value.replace(/\D/g, "");

    // Limit to 6 digits
    setOtp(numericValue.slice(0, 6));
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="page">
      <div className="form-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">VIT CAMPUS</p>

            {step === "credentials" ? (
              <>
                <h1>Login</h1>

                <p>
                  Login with your VIT student account.
                </p>
              </>
            ) : (
              <>
                <h1>Verify Login</h1>

                <p>
                  Enter the verification code sent to
                  your VIT email.
                </p>
              </>
            )}
          </div>
        </div>

        {/* =====================================================
            STEP 1 — EMAIL + PASSWORD
        ===================================================== */}

        {step === "credentials" && (
          <form
            className="report-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {success && (
              <div className="form-success">
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                VIT Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@vitstudent.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Continue"}
            </button>

            <p className="form-footer">
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>
          </form>
        )}

        {/* =====================================================
            STEP 2 — OTP
        ===================================================== */}

        {step === "otp" && (
          <form
            className="report-form"
            onSubmit={handleVerifyOtp}
          >
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {success && (
              <div className="form-success">
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="otp">
                Verification Code
              </label>

              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                required
              />

              <p
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color:
                    otpTimeLeft > 0
                      ? "#666"
                      : "#c62828",
                }}
              >
                {otpTimeLeft > 0
                  ? `OTP expires in ${formatTime(
                      otpTimeLeft
                    )}`
                  : "OTP has expired. Please request a new one."}
              </p>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={
                loading ||
                otp.length !== 6 ||
                otpTimeLeft <= 0
              }
            >
              {loading
                ? "Verifying..."
                : "Verify & Login"}
            </button>

            <div
              style={{
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={
                  loading ||
                  resendTimeLeft > 0
                }
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor:
                    loading ||
                    resendTimeLeft > 0
                      ? "default"
                      : "pointer",
                  color:
                    resendTimeLeft > 0
                      ? "#888"
                      : "inherit",
                  textDecoration:
                    resendTimeLeft > 0
                      ? "none"
                      : "underline",
                }}
              >
                {resendTimeLeft > 0
                  ? `Resend OTP in ${resendTimeLeft}s`
                  : "Resend OTP"}
              </button>
            </div>

            <p
              className="form-footer"
              style={{
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={handleBackToLogin}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                ← Back to login
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

export default Login;