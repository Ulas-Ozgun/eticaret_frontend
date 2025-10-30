import React, { useEffect, useState } from "react";
import { getUsers, addUser } from "../services/UserService";

function UserList() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addUser(newUser);
    setNewUser({ name: "", email: "", password: "" });
    loadUsers();
  };

  return (
    <div className="container mt-5">
      <h2>Kullanıcı Listesi</h2>
      <form onSubmit={handleSubmit} className="mb-3">
        <input
          className="form-control mb-2"
          placeholder="Ad"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Şifre"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <button className="btn btn-primary" type="submit">
          Ekle
        </button>
      </form>

      <ul className="list-group">
        {users.map((u) => (
          <li key={u.id} className="list-group-item">
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
