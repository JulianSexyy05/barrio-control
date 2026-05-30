function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;


// esta pagina de aqui es donde definimos el boton que vamos a estar usando en el dashboard, aqui le pasamos el texto que queremos que aparezca en el boton a traves de las props, y luego lo exportamos para poder usarlo en otras partes de la aplicacion. REUTILIZAMOS.
