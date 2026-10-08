const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem("token");

  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
}

/* =========================================================
   AUTH
========================================================= */

export async function registerUser(
  userData
) {
  return apiRequest(
    "/auth/register",
    {
      method: "POST",

      body: JSON.stringify(
        userData
      ),
    }
  );
}

export async function loginUser(
  credentials
) {
  return apiRequest(
    "/auth/request-otp",
    {
      method: "POST",

      body: JSON.stringify(
        credentials
      ),
    }
  );
}

export async function verifyLoginOtp(
  email,
  otp
) {
  return apiRequest(
    "/auth/verify-otp",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );
}

export async function resendLoginOtp(
  email
) {
  return apiRequest(
    "/auth/resend-otp",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    }
  );
}

export async function getCurrentUser() {
  return apiRequest(
    "/auth/me"
  );
}

/* =========================================================
   ITEMS
========================================================= */

export async function getItems(
  params = ""
) {
  return apiRequest(
    `/items${params}`
  );
}

export async function getItem(
  id
) {
  return apiRequest(
    `/items/${id}`
  );
}

export async function createItem(
  itemData
) {
  return apiRequest(
    "/items",
    {
      method: "POST",

      body: JSON.stringify(
        itemData
      ),
    }
  );
}

/* =========================================================
   CLAIMS
========================================================= */

export async function createClaim(
  itemId,
  message
) {
  return apiRequest(
    `/items/${itemId}/claims`,
    {
      method: "POST",

      body: JSON.stringify({
        message,
      }),
    }
  );
}

export async function getVerificationQuestions(
  itemId
) {
  return apiRequest(
    `/items/${itemId}/verification-questions`
  );
}

export async function createVerificationQuestions(
  itemId,
  questions
) {
  return apiRequest(
    `/items/${itemId}/verification-questions`,
    {
      method: "POST",

      body: JSON.stringify({
        questions,
      }),
    }
  );
}

export async function submitClaimAnswers(
  claimId,
  answers
) {
  return apiRequest(
    `/claims/${claimId}/answers`,
    {
      method: "POST",

      body: JSON.stringify({
        answers,
      }),
    }
  );
}

export async function getMyFoundItemClaims() {
  return apiRequest(
    "/my/found-items/claims"
  );
}

export async function reviewClaim(
  claimId,
  status
) {
  return apiRequest(
    `/claims/${claimId}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        status,
      }),
    }
  );
}