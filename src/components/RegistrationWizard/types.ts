export type RegistrationFormData = {
  // Step 1 — Account details
  nome: string
  surname: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  // Step 2 — Personal info
  gender: string
  birthDate: string
  nationality: string
  tshirtSize: string
  addressStreet: string
  addressNumber: string
  addressState: string
  addressZipcode: string
  emergencyContact: string
  emergencyPhone: string
  // Step 3 — Identity & documents
  identity: string
  nif: string
  identityFile: File[]
  profilePicture: File[]
  disability: string
  sportInsurance: string
  // Step 4 — Preferences
  emailNotifications: boolean
  whatsappNotifications: boolean
  heardAboutClub: string
  wantsInvoiceWithNif: boolean
  consent: boolean
  // Extra CMS-configured fields (keyed by field name)
  [key: string]: string | boolean | File[]
}

export type StepId = 1 | 2 | 3 | 4

export type StepConfig = {
  id: StepId
  title: string
  subtitle: string
}
