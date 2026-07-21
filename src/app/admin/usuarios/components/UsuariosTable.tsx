"use client";

export default function UsuariosTable({
  usuarios,
  filtroNombre,
  setFiltroNombre,
  filtroProvincia,
  setFiltroProvincia,
  filtroTelefono,
  setFiltroTelefono,
  filtroEmail,
  setFiltroEmail,
  filtroRol,
  ordenRegistro,
setOrdenRegistro,
setFiltroRol,
  provincias,
}: {
  usuarios: any[];
  filtroNombre: string;
  setFiltroNombre: React.Dispatch<React.SetStateAction<string>>;
  filtroTelefono: string;
setFiltroTelefono: React.Dispatch<React.SetStateAction<string>>;
filtroEmail: string;
setFiltroEmail: React.Dispatch<React.SetStateAction<string>>;
filtroRol: string;
setFiltroRol: React.Dispatch<React.SetStateAction<string>>;
ordenRegistro: string;
setOrdenRegistro: React.Dispatch<React.SetStateAction<string>>;
  filtroProvincia: string;
  setFiltroProvincia: React.Dispatch<React.SetStateAction<string>>;
  provincias: string[];
}) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: "12px",
        overflowX: "auto",
        marginTop: "30px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "#FFFFFF",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid #333",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "15px" }}>Registro</th>
            <th style={{ padding: "15px" }}>Nombre</th>
            <th style={{ padding: "15px" }}>Provincia</th>
            <th style={{ padding: "15px" }}>Teléfono</th>
            <th style={{ padding: "15px" }}>Email</th>
            <th style={{ padding: "15px" }}>Rol</th>
            <th style={{ padding: "15px" }}>Valoración</th>
            <th style={{ padding: "15px" }}>Operaciones</th>
            <th style={{ padding: "15px" }}>Canceladas</th>
          </tr>
        

        <tr
  style={{
    background: "#151515",
  }}
>
  <th style={{ padding: "8px" }}>
    <select
  value={ordenRegistro}
  onChange={(e) =>
    setOrdenRegistro(e.target.value)
  }
  style={{ width: "100%" }}
>
  <option value="nuevos">
    Más nuevos
  </option>

  <option value="viejos">
    Más viejos
  </option>
</select>
  </th>

  <th style={{ padding: "8px" }}>
    <input
  value={filtroNombre}
  onChange={(e) => setFiltroNombre(e.target.value)}
  placeholder="Buscar..."
  style={{ width: "100%" }}
/>
  </th>

  <th style={{ padding: "8px" }}>
    <select
  value={filtroProvincia}
  onChange={(e) => setFiltroProvincia(e.target.value)}
  style={{ width: "100%" }}
>
  <option value="">Todas</option>

  {provincias.map((provincia) => (
    <option
      key={provincia}
      value={provincia}
    >
      {provincia}
    </option>
  ))}
</select>
  </th>

  <th style={{ padding: "8px" }}>
  <input
    value={filtroTelefono}
    onChange={(e) =>
      setFiltroTelefono(e.target.value)
    }
    placeholder="Buscar..."
    style={{ width: "100%" }}
  />
</th>

  <th style={{ padding: "8px" }}>
  <input
    value={filtroEmail}
    onChange={(e) =>
      setFiltroEmail(e.target.value)
    }
    placeholder="Buscar..."
    style={{ width: "100%" }}
  />
</th>

  <th style={{ padding: "8px" }}>
  <select
    value={filtroRol}
    onChange={(e) =>
      setFiltroRol(e.target.value)
    }
    style={{ width: "100%" }}
  >
    <option value="">Todos</option>
    <option value="admin">
      Administrador
    </option>
    <option value="usuario">
      Usuario
    </option>
  </select>
</th>

  <th />

  <th />

  <th />
</tr>

</thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                style={{
                  borderBottom: "1px solid #333",
                }}
              >
                <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                  {new Date(usuario.created_at).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td style={{ padding: "15px" }}>{usuario.nombre}</td>
                <td style={{ padding: "15px" }}>{usuario.provincia || "-"}</td>
                <td style={{ padding: "15px" }}>{usuario.telefono}</td>
                <td style={{ padding: "15px" }}>{usuario.email || "-"}</td>

                <td style={{ padding: "15px" }}>
                  {usuario.es_admin ? "Administrador" : "Usuario"}
                </td>

                <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
  {usuario.valoracion !== null
    ? `⭐ ${usuario.valoracion.toFixed(1)}`
    : "Sin valoraciones"}
</td>
                <td style={{ padding: "15px", textAlign: "center" }}>
  {usuario.operaciones}
</td>
                <td
  style={{
    padding: "15px",
    textAlign: "center",
    color: usuario.canceladas > 0 ? "#ff6b6b" : "#FFFFFF",
    fontWeight: usuario.canceladas > 0 ? "bold" : "normal",
  }}
>
  {usuario.canceladas}
</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}