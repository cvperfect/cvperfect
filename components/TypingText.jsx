import React from 'react';
import styles from './TypingText.module.css';

const TypingText = ({ text, placeholder }) => {
  return (
    <span className={styles.typingContainer}>
      <span className={styles.typingText}>{text}</span>
      <span className={styles.typingPlaceholder}>{placeholder}</span>
      <span className={styles.typingCursor}>|</span>
    </span>
  );
};

export default TypingText;