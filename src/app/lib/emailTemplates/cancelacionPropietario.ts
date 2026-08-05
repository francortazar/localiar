import { emailTemplate } from "./emailTemplate";

export function cancelacionPropietario({
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

  const contenido = `

    <p>
      Hola <strong>${nombrePropietario}</strong>.
    </p>

    <p>
      Te informamos que una reserva asociada a tu publicación
      fue cancelada correctamente.
    </p>


    <hr style="
      border:none;
      border-top:1px solid #eee;
      margin:30px 0;
    ">


    <table
      cellpadding="8"
      cellspacing="0"
      style="
        width:100%;
        font-size:15px;
      "
    >


      <tr>
        <td>
          <strong>Inquilino</strong>
        </td>

        <td>
          ${nombreInquilino}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Publicación</strong>
        </td>

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
        <td>
          <strong>Fechas liberadas</strong>
        </td>

        <td>
          ${fechas.join("<br>")}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Cantidad de jornadas</strong>
        </td>

        <td>
          ${fechas.length}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Total alquiler afectado</strong>
        </td>

        <td>
          $${totalAlquiler.toLocaleString("es-AR")}
        </td>
      </tr>


      <tr>
        <td>
          <strong>Resguardo</strong>
        </td>

        <td>
          $${resguardo.toLocaleString("es-AR")}
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

      <strong>Información importante</strong>


      <p style="margin-top:10px;">

        Las fechas correspondientes a esta reserva fueron liberadas
        nuevamente y podrán quedar disponibles para futuras reservas.

      </p>


      <p>

        En caso de corresponder, el resguardo podrá ser reclamado al
        finalizar la relación contractual si el espacio no fuera
        devuelto en las condiciones previamente aceptadas.

      </p>


    </div>


  `;


  return emailTemplate({
    titulo: "Reserva cancelada",
    contenido,
  });

}