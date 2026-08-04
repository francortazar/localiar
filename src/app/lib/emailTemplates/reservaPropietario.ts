import { emailTemplate } from "./emailTemplate";

export function reservaPropietario({
  nombrePropietario,
  nombreInquilino,
  titulo,
  urlPublicacion,
  fechas,
  totalAlquiler,
  resguardo,
}: {
  nombrePropietario: string;
  nombreInquilino: string;
  titulo: string;
  urlPublicacion: string;
  fechas: string[];
  totalAlquiler: number;
  resguardo: number;
}) {
  const html = `
    <p>Hola <strong>${nombrePropietario}</strong>,</p>

    <p>
      Has recibido una nueva reserva confirmada.
    </p>

    <h3 style="color:#FF7A00;margin-top:30px;">
      Detalle de la operación
    </h3>

    <table
      cellpadding="8"
      cellspacing="0"
      style="width:100%;border-collapse:collapse;"
    >
      <tr>
        <td><strong>Inquilino</strong></td>
        <td>${nombreInquilino}</td>
      </tr>

      <tr>
        <td><strong>Publicación</strong></td>
        <td>
          <a
            href="${urlPublicacion}"
            style="color:#FF7A00;text-decoration:none;"
          >
            ${titulo}
          </a>
        </td>
      </tr>

      <tr>
        <td><strong>Fechas reservadas</strong></td>
        <td>
          ${fechas.join("<br>")}
        </td>
      </tr>

      <tr>
        <td><strong>Cantidad de jornadas</strong></td>
        <td>${fechas.length}</td>
      </tr>

      <tr>
        <td><strong>Total del alquiler</strong></td>
        <td>
          <strong>
            $${totalAlquiler.toLocaleString("es-AR")}
          </strong>
        </td>
      </tr>

      <tr>
        <td><strong>Resguardo</strong></td>
        <td>
          <strong>
            $${resguardo.toLocaleString("es-AR")}
          </strong>
        </td>
      </tr>
    </table>

    <p style="margin-top:25px;">
      El importe correspondiente al resguardo permanecerá asociado
      a esta operación y podrá reclamarse únicamente conforme a las
      condiciones aceptadas durante la reserva y al procedimiento
      previsto por Localiar para la resolución de controversias.
    </p>
  `;

  return emailTemplate({
    titulo: "Nueva reserva recibida",
    contenido: html,
  });
}