document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("userModal");
  const openBtn = document.querySelector(".add-btn");
  const closeBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelModal");

  const searchInput =
  document.getElementById("searchInput");

const roleFilter =
  document.getElementById("roleFilter");

      // LOAD USERS
  loadUsers();

// SEARCH EVENT
searchInput.addEventListener("keyup", () => {
  loadUsers();
});

// FILTER EVENT
roleFilter.addEventListener("change", () => {
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

    console.log(users);

    const tableBody =
      document.getElementById("userTableBody");

    // GET SEARCH VALUE
    const searchValue =
      document.getElementById("searchInput")
      .value
      .toLowerCase();

    // GET FILTER VALUE
    const roleValue =
      document.getElementById("roleFilter")
      .value
      .toLowerCase();

    tableBody.innerHTML = "";

    // FILTER USERS
    const filteredUsers = users.filter(user => {

      // SEARCH MATCH
      const matchesSearch =
        user.username.toLowerCase().includes(searchValue)
        ||
        user.user_email.toLowerCase().includes(searchValue);

      // ROLE MATCH
      const matchesRole =
        roleValue === "all roles"
        ||
        user.user_role.toLowerCase() === roleValue;

      return matchesSearch && matchesRole;

    });

    // SHOW USERS
    filteredUsers.forEach(user => {

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

              <button class="action-link action-view">
                View
              </button>

              <button class="action-link action-edit">
                Edit
              </button>

            </div>
          </td>

        </tr>
      `;
    });

  } catch(error) {

    console.log("Error loading users:", error);

  }

}