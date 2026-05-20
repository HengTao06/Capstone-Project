let currentPage = 1;
const usersPerPage = 8;

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("userModal");
  const openBtn = document.querySelector(".add-btn");
  const closeBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelModal");

  const searchInput =
  document.getElementById("searchInput");

  const roleFilter =
  document.getElementById("roleFilter");

  const addUserBtn =
  document.getElementById("addUserBtn");

  const editModal =
  document.getElementById("editUserModal");

  const closeEditBtn =
  document.getElementById("closeEditModal");

  const cancelEditBtn =
  document.getElementById("cancelEditModal");

  const saveEditBtn =
  document.getElementById("saveEditBtn");

  saveEditBtn.addEventListener(
    "click",
    saveUserChanges
  );

  function closeEditModal() {

    editModal.classList.remove("active");

  }

  closeEditBtn.addEventListener(
    "click",
    closeEditModal
  );

  cancelEditBtn.addEventListener(
    "click",
    closeEditModal
  );

  editModal.addEventListener("click", (e) => {

    if(e.target === editModal) {

      closeEditModal();

    }

  });

  addUserBtn.addEventListener("click", addUser);
      loadUsers();

  // SEARCH EVENT
  searchInput.addEventListener("keyup", () => {
    currentPage = 1;
    loadUsers();
  });

    // FILTER EVENT
  roleFilter.addEventListener("change", () => {
    currentPage = 1;
    loadUsers();
  });

  // OPEN MODAL
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
  });

  // CLOSE MODAL
  function closeModal() {
    modal.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // CLICK OUTSIDE TO CLOSE
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

});

// LOAD USERS FUNCTION
async function loadUsers() {

  try {

    const response = await fetch("manage_user.php");

    const users = await response.json();

    const tableBody =
      document.getElementById("userTableBody");

    const searchValue =
      document.getElementById("searchInput")
      .value
      .toLowerCase();

    const roleValue =
      document.getElementById("roleFilter")
      .value
      .toLowerCase();

    tableBody.innerHTML = "";

    // FILTER USERS
    const filteredUsers = users.filter(user => {

      const matchesSearch =
        user.username.toLowerCase().includes(searchValue)
        ||
        user.user_email.toLowerCase().includes(searchValue);

      const matchesRole =
        roleValue === "all roles"
        ||
        user.user_role.toLowerCase() === roleValue;

      return matchesSearch && matchesRole;

    });

    // STATS CALCULATION
    const totalUsers = filteredUsers.length;

    const adminUsers = filteredUsers.filter(user =>
      user.user_role.toLowerCase() === "admin"
    ).length;

    const normalUsers = filteredUsers.filter(user =>
    user.user_role.toLowerCase() === "user"
    ).length;

    document.getElementById("activeUsers").innerText = normalUsers;
    document.getElementById("totalUsers").innerText = filteredUsers.length;
    document.getElementById("adminUsers").innerText = adminUsers;

    // PAGINATION
    const totalPages =
      Math.ceil(filteredUsers.length / usersPerPage);

    const startIndex =
      (currentPage - 1) * usersPerPage;

    const endIndex =
      startIndex + usersPerPage;

    const paginatedUsers =
      filteredUsers.slice(startIndex, endIndex);

    // DISPLAY USERS
    paginatedUsers.forEach(user => {

      let badgeClass =
        user.user_role === "admin"
        ? "badge-admin"
        : "badge-user";

      let roleText =
        user.user_role === "admin"
        ? "Admin"
        : "User";

      let initials =
        user.username.substring(0,2).toUpperCase();

      tableBody.innerHTML += `
      
        <tr>

          <td>
            <div class="user-cell">

              <div class="avatar">
                ${initials}
              </div>

              <span class="user-name">
                ${user.username}
              </span>

            </div>
          </td>

          <td class="email-cell">
            ${user.user_email}
          </td>

          <td>
            <span class="badge ${badgeClass}">
              ${roleText}
            </span>
          </td>

          <td>
            <div class="actions-cell">

            <button class="action-link action-edit" onclick='openEditModal(${JSON.stringify(user)})'>
              Edit
            </button>

            </div>
          </td>

        </tr>
      `;
    });

    // PAGINATION INFO
    const showingStart =
      filteredUsers.length === 0
      ? 0
      : startIndex + 1;

    const showingEnd =
      Math.min(endIndex, filteredUsers.length);

    document.querySelector(".pagination-info").innerText =
      `Showing ${showingStart} to ${showingEnd} of ${filteredUsers.length} users`;

    // PAGINATION BUTTONS
    const paginationControls =
      document.querySelector(".pagination-controls");

    paginationControls.innerHTML = "";

    // PREVIOUS BUTTON
    paginationControls.innerHTML += `
      <button
        class="page-btn prev-next"
        ${currentPage === 1 ? "disabled" : ""}
        onclick="changePage(${currentPage - 1})"
      >
        ← Previous
      </button>
    `;

    // PAGE BUTTONS
    for(let i = 1; i <= totalPages; i++) {

      paginationControls.innerHTML += `
        <button
          class="page-btn ${i === currentPage ? "active" : ""}"
          onclick="changePage(${i})"
        >
          ${i}
        </button>
      `;
    }

    // NEXT BUTTON
    paginationControls.innerHTML += `
      <button
        class="page-btn prev-next"
        ${currentPage === totalPages ? "disabled" : ""}
        onclick="changePage(${currentPage + 1})"
      >
        Next →
      </button>
    `;

  } catch(error) {

    console.log("Error loading users:", error);

  }

}

function changePage(page) {

  currentPage = page;

  loadUsers();

}

async function openEditModal(user) {

  const modal =
    document.getElementById("editUserModal");

  modal.classList.add("active");

  // USER INFO
  document.getElementById("editUserId").value =
    user.user_id;

  document.getElementById("editUsername").value =
    user.username;

  document.getElementById("editEmail").value =
    user.user_email;

  document.getElementById("editRole").value =
    user.user_role;

  // PROFILE
  document.getElementById("editProfileName").innerText =
    user.username;

  document.getElementById("editAvatar").innerText =
    user.username.substring(0,2).toUpperCase();

  // LOAD USER STATS
  try {

    const response = await fetch(
      `manage_user.php?action=stats&user_id=${user.user_id}`
    );

    const stats = await response.json();

    document.getElementById("totalTrips").innerText =
      stats.trips;

    document.getElementById("totalReviews").innerText =
      stats.reviews;

  } catch(error) {

    console.log(error);

  }

}

async function saveUserChanges() {

  const userId =
    document.getElementById("editUserId").value;

  const username =
    document.getElementById("editUsername").value.trim();

  const email =
    document.getElementById("editEmail").value.trim();

  const role =
    document.getElementById("editRole").value;

  // VALIDATION
  if(
    username === "" ||
    email === "" ||
    role === ""
  ) {

    alert("Please fill in all fields");

    return;

  }

  try {

    const response = await fetch(
      "edit_user.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          username: username,
          email: email,
          role: role
        })
      }
    );

    const result = await response.json();

    if(result.success) {

      alert("User updated successfully");

      // CLOSE MODAL
      document
        .getElementById("editUserModal")
        .classList.remove("active");

      // RELOAD TABLE
      loadUsers();

    } else {

      alert(result.message);

    }

  } catch(error) {

    console.log(error);

  }

}

async function addUser() {

  const username =
    document.getElementById("addUsername").value.trim();

  const email =
    document.getElementById("addEmail").value.trim();

  const password =
    document.getElementById("addPassword").value.trim();

  const role =
    document.getElementById("addRole").value;

  // VALIDATION
  if(
    username === "" ||
    email === "" ||
    password === "" ||
    role === ""
  ) {

    alert("Please fill in all fields");
    return;

  }

  try {

    const response = await fetch(
      "add_user.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role
        })
      }
    );

    const result = await response.json();

    if(result.success) {

      alert("User added successfully");

      // CLOSE MODAL
      document
        .getElementById("userModal")
        .classList.remove("active");

      // CLEAR FORM
      document.getElementById("addUsername").value = "";
      document.getElementById("addEmail").value = "";
      document.getElementById("addPassword").value = "";
      document.getElementById("addRole").value = "";

      // RELOAD USERS
      loadUsers();

    } else {

      alert(result.message);

    }

  } catch(error) {

    console.log(error);

  }

}