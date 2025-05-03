// pages/confirm-account.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ConfirmAccount() {
  const router = useRouter();
  const { token } = router.query;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`/api/get-google-profile?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setProfile(data.profile);
          }
          setLoading(false);
        })
        .catch((error) => {
        //   setError("Failed to load profile");
        console.error("Error fetching profile:", error);
          setLoading(false);
        });
    }
  }, [token]);

  const handleConfirm = async () => {
    const res = await fetch("/api/create-account-from-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/auth/login?accountCreated=true");
    } else {
      setError(data.error || "Failed to create account");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Create Account</h1>
      <p>
        You don’t have an account with us. Would you like to create one using your Google information?
      </p>
      {/* <p>Name: {profile?.name || "No name"}</p>
      <p>Email: {profile?.email || "No email"}</p> */}
      <button onClick={handleConfirm}>Yes, Create Account</button>
      <button onClick={() => router.push("/auth/login")}>No, Cancel</button>
    </div>
  );
}