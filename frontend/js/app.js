
document.addEventListener("DOMContentLoaded", () => {
  // ---------- HELPERS ----------
  const $ = (selector) => document.querySelector(selector);

  function showMessage(id, message) {
    const element = document.getElementById(id);
    if (element) element.textContent = message;
  }

  function makeElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  // ---------- STUDENT REGISTRATION ----------
  const registerForm = $("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      showMessage("registerMessage", "Creating account...");

      try {
        const result = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: $("#registerName").value.trim(),
            email: $("#registerEmail").value.trim(),
            password: $("#registerPassword").value,
          }),
        });

        showMessage("registerMessage", result.message);
        registerForm.reset();

        setTimeout(() => {
          window.location.href = "./login.html";
        }, 700);
      } catch (error) {
        showMessage("registerMessage", error.message);
      }
    });
  }

  // ---------- STUDENT LOGIN ----------
  const loginForm = $("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage("loginMessage", "Signing in...");

      try {
        const result = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: $("#loginEmail").value.trim(),
            password: $("#loginPassword").value,
          }),
        });

        if (result.user.role !== "STUDENT") {
          showMessage("loginMessage", "Please use Admin Login.");
          return;
        }

        saveSession(result);
        window.location.href = "./dashboard.html";
      } catch (error) {
        showMessage("loginMessage", error.message);
      }
    });
  }

  // ---------- ADMIN LOGIN ----------
  const adminLoginForm = $("#adminLoginForm");

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage("adminLoginMessage", "Signing in...");

      try {
        const result = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: $("#adminEmail").value.trim(),
            password: $("#adminPassword").value,
          }),
        });

        if (result.user.role !== "ADMIN") {
          showMessage(
            "adminLoginMessage",
            "Access denied. Admin account required."
          );
          return;
        }

        saveSession(result);
        window.location.href = "./admin-dashboard.html";
      } catch (error) {
        showMessage("adminLoginMessage", error.message);
      }
    });
  }

  // ---------- SESSION VERIFICATION ----------
  async function verifyRole(requiredRole, loginPage) {
    if (!localStorage.getItem("campusCareToken")) {
      window.location.replace(loginPage);
      return false;
    }

    try {
      const result = await apiRequest("/auth/me");

      if (result.user.role !== requiredRole) {
        clearSession();
        window.location.replace(loginPage);
        return false;
      }

      localStorage.setItem("campusCareUser", JSON.stringify(result.user));
      return true;
    } catch {
      clearSession();
      window.location.replace(loginPage);
      return false;
    }
  }

  // ---------- STUDENT DASHBOARD ----------
  async function loadStudentDashboard() {
    const list = $("#studentComplaintList");
    if (!list) return;

    try {
      const result = await apiRequest("/complaints");
      const complaints = result.complaints || [];

      const total = $("#studentTotal");
      const pending = $("#studentPending");
      const progress = $("#studentProgress");
      const resolved = $("#studentResolved");

      if (total) total.textContent = complaints.length;
      if (pending) {
        pending.textContent = complaints.filter(c => c.status === "Pending").length;
      }
      if (progress) {
        progress.textContent = complaints.filter(c => c.status === "In Progress").length;
      }
      if (resolved) {
        resolved.textContent = complaints.filter(c => c.status === "Resolved").length;
      }

      list.replaceChildren();

      if (complaints.length === 0) {
        list.appendChild(makeElement("p", "You have not submitted any complaints yet."));
        return;
      }

      complaints.forEach((complaint) => {
        const card = makeElement("article", "", "complaint-card");
        card.appendChild(makeElement("h3", complaint.title));
        card.appendChild(makeElement("p", `ID: ${complaint.complaintId}`));
        card.appendChild(makeElement("p", `Category: ${complaint.category}`));
        card.appendChild(makeElement("p", `Department: ${complaint.department}`));
        card.appendChild(makeElement("p", `Location: ${complaint.location}`));
        card.appendChild(makeElement("p", `Status: ${complaint.status}`));
        card.appendChild(makeElement("p", `Priority: ${complaint.priority}`));
        card.appendChild(makeElement("p", complaint.description));
        list.appendChild(card);
      });
    } catch (error) {
      list.textContent = error.message;
    }
  }

  // ---------- COMPLAINT SUBMISSION ----------
  const complaintForm = $("#complaintForm");

  if (complaintForm) {
    complaintForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage("complaintMessage", "Submitting complaint...");

      try {
        const result = await apiRequest("/complaints", {
          method: "POST",
          body: JSON.stringify({
            title: $("#complaintTitle").value.trim(),
            category: $("#complaintCategory").value,
            department: $("#complaintDepartment").value,
            location: $("#complaintLocation").value.trim(),
            description: $("#complaintDescription").value.trim(),
            priority: $("#complaintPriority").value,
          }),
        });

        showMessage(
          "complaintMessage",
          `Complaint submitted! ID: ${result.complaint.complaintId}`
        );

        complaintForm.reset();
      } catch (error) {
        showMessage("complaintMessage", error.message);
      }
    });
  }

  // ---------- ADMIN DASHBOARD ----------
  async function loadAdminDashboard() {
    const list = $("#adminComplaintList");
    if (!list) return;

    try {
      const result = await apiRequest("/complaints/admin/all");
      const complaints = result.complaints || [];

      $("#adminTotal").textContent = complaints.length;
      $("#adminPending").textContent =
        complaints.filter(c => c.status === "Pending").length;
      $("#adminProgress").textContent =
        complaints.filter(c => c.status === "In Progress").length;
      $("#adminResolved").textContent =
        complaints.filter(c => c.status === "Resolved").length;

      list.replaceChildren();

      if (complaints.length === 0) {
        list.appendChild(makeElement("p", "No complaints submitted yet."));
        return;
      }

      complaints.forEach((complaint) => {
        const card = makeElement("article", "", "complaint-card");

        card.appendChild(makeElement("h3", complaint.title));
        card.appendChild(makeElement("p", `ID: ${complaint.complaintId}`));
        card.appendChild(makeElement("p", `Category: ${complaint.category}`));
        card.appendChild(makeElement("p", `Department: ${complaint.department}`));
        card.appendChild(makeElement("p", `Location: ${complaint.location}`));
        card.appendChild(makeElement("p", complaint.description));

        const student = complaint.userId
          ? `${complaint.userId.name} (${complaint.userId.email})`
          : "Student details unavailable";

        card.appendChild(makeElement("p", `Student: ${student}`));

        const statusSelect = document.createElement("select");

        ["Pending", "In Progress", "Resolved"].forEach((status) => {
          const option = document.createElement("option");
          option.value = status;
          option.textContent = status;
          option.selected = status === complaint.status;
          statusSelect.appendChild(option);
        });

        const updateButton = makeElement("button", "Update Status");
        updateButton.type = "button";

        updateButton.addEventListener("click", async () => {
          updateButton.disabled = true;

          try {
            await apiRequest(
              `/complaints/${encodeURIComponent(complaint._id)}/status`,
              {
                method: "PATCH",
                body: JSON.stringify({ status: statusSelect.value }),
              }
            );

            await loadAdminDashboard();
          } catch (error) {
            alert(error.message);
          } finally {
            updateButton.disabled = false;
          }
        });

        card.append(statusSelect, updateButton);
        // FEEDBACK FOR RESOLVED COMPLAINTS
        // FEEDBACK FOR RESOLVED COMPLAINTS
    if (complaint.status === "Resolved") {
        const feedbackSection = document.createElement("div");
        feedbackSection.className = "feedback-section";

        const heading = makeElement("h4", "⭐ Rate Your Experience");
        feedbackSection.appendChild(heading);

        if (complaint.feedback?.submittedAt) {
            const rating = makeElement(
                "p",
                `Your rating: ${"★".repeat(complaint.feedback.rating)}${"☆".repeat(5 - complaint.feedback.rating)}`,
                "feedback-rating"
            );
            feedbackSection.appendChild(rating);

            if (complaint.feedback.comment) {
                feedbackSection.appendChild(
                    makeElement("p", complaint.feedback.comment)
                );
            }

            feedbackSection.appendChild(
                makeElement("p", "Thank you for your feedback!")
            );
        } else {
            feedbackSection.appendChild(
                makeElement("p", "Your complaint is resolved. Share your experience.")
            );

            const stars = document.createElement("div");
            stars.className = "feedback-stars";

            let selectedRating = 0;

            for (let i = 1; i <= 5; i++) {
                const star = document.createElement("button");
                star.type = "button";
                star.textContent = "★";
                star.setAttribute("aria-label", `${i} star${i > 1 ? "s" : ""}`);

                star.addEventListener("click", () => {
                    selectedRating = i;

                    [...stars.children].forEach((button, index) => {
                        button.classList.toggle("active", index < i);
                    });
                });

                stars.appendChild(star);
            }

            feedbackSection.appendChild(stars);

            const comment = document.createElement("textarea");
            comment.placeholder = "Tell us about your experience (optional)";
            comment.maxLength = 500;
            comment.setAttribute("aria-label", "Your feedback");
            feedbackSection.appendChild(comment);

            const submit = makeElement("button", "Submit Feedback");
            submit.type = "button";

            submit.addEventListener("click", async () => {
                if (!selectedRating) {
                    alert("Please select a rating from 1 to 5 stars.");
                    return;
                }

                submit.disabled = true;

                try {
                    const result = await apiRequest(
                        `/complaints/${complaint._id}/feedback`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                rating: selectedRating,
                                comment: comment.value.trim()
                            })
                        }
                    );

                    alert(result.message);
                    await loadStudentDashboard();
                } catch (error) {
                    alert(error.message);
                    submit.disabled = false;
                }
            });

            feedbackSection.appendChild(submit);
         }

        card.appendChild(feedbackSection);
      }
        list.appendChild(card);
      });
    } catch (error) {
      list.textContent = error.message;
    }
  }

  // ---------- LOGOUT ----------
  const logoutButton = $("#logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      clearSession();
      window.location.href = "./login.html";
    });
  }

  const adminLogout = $("#adminLogout");
  if (adminLogout) {
    adminLogout.addEventListener("click", () => {
      clearSession();
      window.location.href = "./admin-login.html";
    });
  }

  // ---------- PAGE GUARDS ----------
  if (window.location.pathname.endsWith("/dashboard.html")) {
    verifyRole("STUDENT", "./login.html").then(ok => {
      if (ok) loadStudentDashboard();
    });
  }

  if (window.location.pathname.endsWith("/complaint.html")) {
    verifyRole("STUDENT", "./login.html");
  }

  if (window.location.pathname.endsWith("/admin-dashboard.html")) {
    verifyRole("ADMIN", "./admin-login.html").then(ok => {
      if (ok) loadAdminDashboard();
    });
  }
});
