import styles from './header.module.scss'
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="logo"/>
        </a>
      </Link>
    </header>
  )
}
