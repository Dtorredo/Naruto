"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generatePrescriptionPDF } from "@/lib/pdf-generator"
import { useState } from "react"

interface PrescriptionPDFButtonProps {
  prescription: {
    id: string
    medication_name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string | null
    prescribed_date: string
  }
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

export function PrescriptionPDFButton({ prescription, patient, doctor }: PrescriptionPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = () => {
    setIsGenerating(true)
    try {
      generatePrescriptionPDF({
        ...prescription,
        patient,
        doctor,
      })
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      size="sm"
      variant="outline"
      className="gap-2 bg-transparent"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Download PDF"}
    </Button>
  )
}
