import { enviarEmailsReserva } from "./enviarEmailsReserva";

export async function procesarPagoConfirmado(
  operacionId: string
) {
  await enviarEmailsReserva(operacionId);
}