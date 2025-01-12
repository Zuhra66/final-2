function showPokemonModal(pokemon) {
  // Populate the modal with Pokémon details
  document.getElementById('pokemonModalLabel').textContent = pokemon.name || "Unknown Name";
  document.getElementById('pokemonImage').src = `/img/${pokemon.imgName}` || "";
  document.getElementById('pokemonImage').alt = pokemon.name || "Pokemon Image";
  document.getElementById('pokemonDescription').textContent = pokemon.description || "No description available.";
  document.getElementById('pokemonElementId').textContent = pokemon.elementId || "No element specified."; // Use 'pokemonElementId'
  document.getElementById('pokemonScore').textContent = pokemon.score || "No score available.";

  // Show the modal
  new bootstrap.Modal(document.getElementById('pokemonModal')).show();
}

const form = document.getElementById("quizForm");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const response = await fetch("/quiz", {
      method: "POST",
      body: formData,
  });

  const data = await response.json();

  if (data.correct) {
      resultDiv.innerHTML = "<strong><p style='color: green;'>Correct!</p></strong>";
  } else {
      resultDiv.innerHTML = "<p style='color: red;'>Incorrect!</p>";
  }
});
