document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // supaya form tidak reload halaman

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login berhasil sebagai " + data.user.role + "!");
      localStorage.setItem("token", data.access_token);
      window.location.href = "index.html"; // pindah ke dashboard atau halaman utama
    } else {
      alert("Login gagal: " + (data.message || "Email atau password salah"));
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    alert("Tidak bisa terhubung ke server Laravel.");
  }
});
