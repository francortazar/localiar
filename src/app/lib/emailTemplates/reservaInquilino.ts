import { emailTemplate } from "./emailTemplate";

export function reservaInquilino({
  nombreInquilino,
  nombrePropietario,
  titulo,
  urlPublicacion,
  fechas,
  totalAlquiler,
  resguardo,
}: {
  nombreInquilino: string;
  nombrePropietario: string;
  titulo: string;
  urlPublicacion: string;
  fechas: string[];
  totalAlquiler: number;
  resguardo: number;
}) {
  const contenido = `
    <p>
      Hola <strong>${nombreInquilino}</strong>.
    </p>

    <p>
      Tu reserva fue confirmada correctamente.
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">

    <table
      cellpadding="8"
      cellspacing="0"
      style="width:100%;font-size:15px;"
    >

      <tr>
        <td><strong>Propietario</strong></td>
        <td>${nombrePropietario}</td>
      </tr>

      <tr>
        <td><strong>Publicación</strong></td>
        <td>
          <a
            href="${urlPublicacion}"
            style="
              color:#FF7A00;
              text-decoration:none;
              font-weight:bold;
            "
          >
            ${titulo}
          </a>
        </td>
      </tr>

      <tr>
        <td><strong>Fechas</strong></td>
        <td>${fechas.join("<br>")}</td>
      </tr>

      <tr>
        <td><strong>Cantidad de jornadas</strong></td>
        <td>${fechas.length}</td>
      </tr>

      <tr>
        <td><strong>Total alquiler</strong></td>
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

    <div
      style="
        margin-top:30px;
        padding:18px;
        background:#FFF7EF;
        border-left:5px solid #FF7A00;
        border-radius:8px;
      "
    >

      <strong>Importante</strong>

      <p style="margin-top:10px;">
        El importe correspondiente al resguardo será devuelto al
        finalizar la reserva siempre que el espacio sea restituido
        en las condiciones aceptadas por ambas partes.
      </p>

    </div>
  `;

  return emailTemplate({
    titulo: "Reserva confirmada",
    contenido,
  });
}