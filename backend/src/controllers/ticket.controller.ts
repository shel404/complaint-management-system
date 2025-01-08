import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { CreateTicketDTO, UpdateTicketDTO } from "../types/ticket.types";

const prisma = new PrismaClient();

const assignAdminToTicket = async () => {
  // Find all admins with their open ticket count
  const adminsWithTicketCount = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      adminTickets: {
        where: {
          status: "OPEN",
        },
      },
    },
  });

  if (adminsWithTicketCount.length === 0) {
    return null;
  }

  // Group admins by their ticket count
  const adminsByTicketCount = adminsWithTicketCount.reduce((acc, admin) => {
    const count = admin.adminTickets.length;
    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(admin);
    return acc;
  }, {} as Record<number, typeof adminsWithTicketCount>);

  // Find the minimum ticket count
  const minTicketCount = Math.min(
    ...Object.keys(adminsByTicketCount).map(Number)
  );

  // Get all admins with minimum ticket count
  const adminsWithMinTickets = adminsByTicketCount[minTicketCount];

  // Randomly select one admin from those with minimum tickets
  const randomIndex = Math.floor(Math.random() * adminsWithMinTickets.length);
  return adminsWithMinTickets[randomIndex];
};

export const createTicket = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.user || req.user.role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ message: "Only customers can create tickets" });
    }

    const { subject, description }: CreateTicketDTO = req.body;

    const assignedAdmin = await assignAdminToTicket();

    if (!assignedAdmin) {
      return res.status(500).json({ message: "No admin available" });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        customerId: req.user.id,
        adminId: assignedAdmin.id,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTickets = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const tickets = await prisma.ticket.findMany({
      where: req.user.role === "ADMIN" ? {} : { customerId: req.user.id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTicket = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ticketId = parseInt(req.params.id);
    const updates: UpdateTicketDTO = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user.role === "CUSTOMER" && ticket.customerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...updates,
        adminId: req.user.role === "ADMIN" ? req.user.id : undefined,
      },
    });

    return res.json(updatedTicket);
  } catch (error) {
    console.error("Update ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTicket = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const ticketId = parseInt(req.params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user.role === "CUSTOMER" && ticket.customerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete ticket error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
