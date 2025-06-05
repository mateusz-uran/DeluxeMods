import React from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.wrapper}>
      <form>
        <h2>Login</h2>
        <p className="error">Wrong email or password</p>
        <div className={styles.inputWrapper}>
          <p>Email</p>
          <input type="text" />
        </div>

        <div className={styles.inputWrapper}>
          <p>Password</p>
          <input type="password" />
        </div>

        <div className={styles.submitWrapper}>
          <div className={styles.rememberme}>
            <input type="checkbox" />
            <p>Remember me</p>
          </div>
          <button type="submit" className="primary-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
