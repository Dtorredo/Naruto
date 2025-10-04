import jsPDF from "jspdf"

interface PrescriptionData {
  id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
  prescribed_date: string
  patient: {
    first_name: string
    last_name: string
    date_of_birth: string
    blood_type: string | null
    address: string | null
  }
  doctor: {
    full_name: string
    specialization: string | null
  }
}

export function generatePrescriptionPDF(prescription: PrescriptionData) {
  const doc = new jsPDF()

  // Set up colors
  const primaryColor: [number, number, number] = [14, 165, 233] // Sky blue
  const textColor: [number, number, number] = [15, 23, 42]
  const grayColor: [number, number, number] = [100, 116, 139]

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 40, "F")

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("PRESCRIPTION", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Prenatal Care Center", 105, 30, { align: "center" })

  // Reset text color
  doc.setTextColor(textColor[0], textColor[1], textColor[2])

  // Patient Information Section
  let yPos = 55

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Patient Information", 20, yPos)

  yPos += 8
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  doc.setFont("helvetica", "bold")
  doc.text("Name:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(`${prescription.patient.first_name} ${prescription.patient.last_name}`, 50, yPos)

  yPos += 6
  doc.setFont("helvetica", "bold")
  doc.text("Date of Birth:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(new Date(prescription.patient.date_of_birth).toLocaleDateString(), 50, yPos)

  if (prescription.patient.blood_type) {
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text("Blood Type:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(prescription.patient.blood_type, 50, yPos)
  }

  if (prescription.patient.address) {
    yPos += 6
    doc.setFont("helvetica", "bold")
    doc.text("Address:", 20, yPos)
    doc.setFont("helvetica", "normal")
    const addressLines = doc.splitTextToSize(prescription.patient.address, 140)
    doc.text(addressLines, 50, yPos)
    yPos += (addressLines.length - 1) * 6
  }

  // Prescription Date
  yPos += 6
  doc.setFont("helvetica", "bold")
  doc.text("Date:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(new Date(prescription.prescribed_date).toLocaleDateString(), 50, yPos)

  // Divider line
  yPos += 10
  doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
  doc.line(20, yPos, 190, yPos)

  // Prescription Details Section
  yPos += 10
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Prescription Details", 20, yPos)

  // Medication box
  yPos += 8
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, yPos, 170, 50, 3, 3, "F")

  yPos += 8
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Medication:", 25, yPos)
  doc.setFontSize(14)
  doc.text(prescription.medication_name, 25, yPos + 7)

  yPos += 15
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Dosage:", 25, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(prescription.dosage, 70, yPos)

  yPos += 6
  doc.setFont("helvetica", "bold")
  doc.text("Frequency:", 25, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(prescription.frequency, 70, yPos)

  yPos += 6
  doc.setFont("helvetica", "bold")
  doc.text("Duration:", 25, yPos)
  doc.setFont("helvetica", "normal")
  doc.text(prescription.duration, 70, yPos)

  // Instructions section
  if (prescription.instructions) {
    yPos += 15
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Instructions:", 20, yPos)

    yPos += 7
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const instructionLines = doc.splitTextToSize(prescription.instructions, 170)
    doc.text(instructionLines, 20, yPos)
    yPos += instructionLines.length * 6
  }

  // Doctor Information Section
  yPos += 15
  doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
  doc.line(20, yPos, 190, yPos)

  yPos += 10
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Prescribed By", 20, yPos)

  yPos += 8
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(prescription.doctor.full_name, 20, yPos)

  if (prescription.doctor.specialization) {
    yPos += 6
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.text(prescription.doctor.specialization, 20, yPos)
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  doc.text("This is a computer-generated prescription.", 105, pageHeight - 20, { align: "center" })
  doc.text("For any queries, please contact your healthcare provider.", 105, pageHeight - 15, { align: "center" })

  // Prescription ID at bottom
  doc.setFontSize(7)
  doc.text(`Prescription ID: ${prescription.id}`, 105, pageHeight - 10, { align: "center" })

  // Save the PDF
  const fileName = `Prescription_${prescription.patient.last_name}_${new Date(prescription.prescribed_date).toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
