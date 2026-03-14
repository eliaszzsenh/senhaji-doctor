import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNewAppointmentNotification(appointment: any) {
  const serviceNames: Record<string, string> = {
    general: "Odontologie Générale",
    endodontics: "Endodontie Rotatoire",
    aesthetic: "Esthétique Dentaire",
    prosthesis: "Prothèse Dentaire",
    surgery: "Chirurgie Orale",
    laser: "Laser Dentaire",
    endodoncia: "Endodontie Rotatoire",
    estetica: "Esthétique Dentaire",
    protesis: "Prothèse Dentaire",
    cirugia: "Chirurgie Orale",
  };

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@centredentairesenhaji.com",
      to: process.env.ADMIN_EMAIL || "cdsstomato@gmail.com",
      subject: `🦷 Nouvelle demande de RDV — ${appointment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1E40AF; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Centre Dentaire Senhaji</h1>
            <p style="color: #DBEAFE; margin: 5px 0;">Nouvelle demande de rendez-vous</p>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1E40AF;">Détails du patient</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold;">Nom:</td><td>${appointment.name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td>${appointment.email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Téléphone:</td><td>${appointment.phone}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service:</td><td>${serviceNames[appointment.service] || appointment.service}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Date souhaitée:</td><td>${appointment.preferred_date}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Créneau:</td><td>${appointment.preferred_time === "matin" ? "Matin (9h-13h)" : "Après-midi (14h-19h)"}</td></tr>
              ${appointment.notes ? `<tr><td style="padding: 8px; font-weight: bold;">Notes:</td><td>${appointment.notes}</td></tr>` : ""}
            </table>
          </div>
        </div>
      `,
    });
    console.log("New appointment email sent to admin");
  } catch (error) {
    console.error("Error sending email to admin:", error);
  }
}

export async function sendAppointmentConfirmation(appointment: any) {
  const messages: Record<string, any> = {
    fr: {
      subject: "✅ Demande de RDV reçue — Centre Dentaire Senhaji",
      body: `Bonjour ${appointment.name},\n\nVotre demande de rendez-vous a bien été reçue.\nNous vous contacterons sous 24h pour confirmer votre créneau.\n\nCordialement,\nLe Centre Dentaire Senhaji`,
    },
    en: {
      subject: "✅ Appointment Request Received — Centre Dentaire Senhaji",
      body: `Hello ${appointment.name},\n\nYour appointment request has been received.\nWe will contact you within 24h to confirm your slot.\n\nBest regards,\nCentre Dentaire Senhaji`,
    },
  };

  const lang = appointment.lang || "fr";
  const msg = messages[lang] || messages["fr"];

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@centredentairesenhaji.com",
      to: appointment.email,
      subject: msg.subject,
      text: msg.body,
    });
    console.log("Confirmation email sent to patient");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

export async function sendAppointmentConfirmedByDoctor(appointment: any) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@centredentairesenhaji.com",
      to: appointment.email,
      subject: "🦷 Votre rendez-vous est confirmé — Centre Dentaire Senhaji",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Rendez-vous Confirmé</h1>
          </div>
          <div style="padding: 30px;">
            <p>Bonjour <strong>${appointment.name}</strong>,</p>
            <p>Le Dr Senhaji Jalil confirme votre rendez-vous :</p>
            <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p>📅 <strong>Date:</strong> ${appointment.preferred_date}</p>
              <p>🕐 <strong>Créneau:</strong> ${appointment.preferred_time === "matin" ? "Matin (9h-13h)" : "Après-midi (14h-19h)"}</p>
              <p>📞 <strong>Contact:</strong> +212 707 15 15 14</p>
            </div>
            <p>Pensez à arriver 5 minutes en avance. À bientôt ! 😊</p>
          </div>
        </div>
      `,
    });
    console.log("Confirmation email sent to patient");
  } catch (error) {
    console.error("Error sending doctor confirmation email:", error);
  }
}
