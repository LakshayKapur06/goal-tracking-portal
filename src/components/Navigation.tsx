"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./Navigation.module.css";
import { Target } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className={styles.nav}>
      <Link href="/dashboard" className={styles.brand}>
        <Target size={24} color="var(--primary)" />
        <span>GoalTracker</span>
      </Link>

      <div className={styles.menu}>
        <Link 
          href="/dashboard" 
          className={`${styles.link} ${pathname === "/dashboard" ? styles.active : ""}`}
        >
          Dashboard
        </Link>
        
        {session.user.role === "EMPLOYEE" && (
          <>
            <Link 
              href="/goals/create" 
              className={`${styles.link} ${pathname === "/goals/create" ? styles.active : ""}`}
            >
              My Goals
            </Link>
            <Link 
              href="/check-ins/employee" 
              className={`${styles.link} ${pathname === "/check-ins/employee" ? styles.active : ""}`}
            >
              Check-ins
            </Link>
          </>
        )}

        {session.user.role === "MANAGER" && (
          <>
            <Link 
              href="/goals/review" 
              className={`${styles.link} ${pathname === "/goals/review" ? styles.active : ""}`}
            >
              Team Goals
            </Link>
            <Link 
              href="/check-ins/manager" 
              className={`${styles.link} ${pathname === "/check-ins/manager" ? styles.active : ""}`}
            >
              Team Check-ins
            </Link>
          </>
        )}

        {session.user.role === "ADMIN" && (
          <>
            <Link 
              href="/admin/cycles" 
              className={`${styles.link} ${pathname === "/admin/cycles" ? styles.active : ""}`}
            >
              Manage Cycles
            </Link>
            <Link 
              href="/admin/analytics" 
              className={`${styles.link} ${pathname === "/admin/analytics" ? styles.active : ""}`}
            >
              Analytics
            </Link>
            <Link 
              href="/admin/audit" 
              className={`${styles.link} ${pathname === "/admin/audit" ? styles.active : ""}`}
            >
              Audit Logs
            </Link>
          </>
        )}
      </div>

      <div className={styles.userInfo}>
        <span className={styles.roleBadge}>{session.user.role}</span>
        <span style={{ fontSize: '0.9rem' }}>{session.user.name}</span>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
