export interface CreateTicketDTO {
  subject: string;
  description: string;
}

export interface UpdateTicketDTO {
  subject?: string;
  description?: string;
  status?: "OPEN" | "RESOLVED" | "CLOSED";
}

export interface TicketResponse {
  id: number;
  subject: string;
  description: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  customerId: number;
  adminId: number | null;
}
