(function () {
  const $pokemonList = document.querySelector('#pokemonList');
  const $paginationContainer = document.querySelector('#pagination');

  let offset = history.state ? history.state.offset : 0;
  const paginationLimit = 6;

  async function fetchPokemons(offset, limit) {
    try {
      const URL = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
      const response = await fetch(URL);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchPokemonsListDetail(offset, limit) {
    try {
      const { results } = await fetchPokemons(offset, limit);
      const pokemonDetails = await Promise.all(
        results?.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          const data = await response.json();
          return data;
        })
      );
      return pokemonDetails;
    } catch (error) {
      console.log(error);
    }
  }

  async function sanitizePokemonListDetails(pokemonDetails) {
    try {
      const pokemonResults = await pokemonDetails;
      const _pokemonDetails = pokemonResults.map((pokemon) => {
        const { name, id, types, stats, sprites } = pokemon;
        const _types = types.map((type) => type.type.name);
        const _stats = stats.map((stat) => {
          return {
            name: stat.stat.name,
            value: stat.base_stat,
          };
        });
        return {
          name,
          id,
          types: _types,
          stats: _stats,
          image: sprites.other['official-artwork'].front_default,
        };
      });
      return _pokemonDetails;
    } catch (error) {
      console.log(error);
    }
  }

  function handlePokemonCardClick(index) {
    const selectedPokemon = document.querySelectorAll('.pokemonCard')[index];
    const pokemonId = selectedPokemon.getAttribute('data-pokemon-id');
    const currentState = {
      offset: offset,
    };

    // Use replaceState instead of pushState to overwrite the current state
    history.replaceState(currentState, null);
    window.location.href = `pokemonDetail.html?id=${pokemonId}`;
  }

  async function displayPokemonList() {
    const pokemonDetails = await sanitizePokemonListDetails(
      fetchPokemonsListDetail(offset, paginationLimit)
    );

    $pokemonList.innerHTML = '';

    pokemonDetails.forEach((pokemon) => {
      const pokemonCardHTML = createPokemonCard(pokemon);
      $pokemonList.insertAdjacentHTML('beforeend', pokemonCardHTML);
    });

    $pokemonList.querySelectorAll('.pokemonCard').forEach((card, index) => {
      card.addEventListener('click', () => handlePokemonCardClick(index));
    });

    updatePagination();
  }

  function createPaginationButtons(totalPages, currentPage) {
    let paginationHTML = '';

    if (currentPage > 1) {
      paginationHTML += `<button id="prevPage" class="paginationButton">&lt;</button>`;
    }
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="paginationButton ${
        i === currentPage ? 'active' : ''
      }" data-page="${i}">${i}</button>`;
    }

    if (currentPage < totalPages) {
      paginationHTML += `<button id="nextPage" class="paginationButton">&gt;</button>`;
    }

    $paginationContainer.innerHTML = paginationHTML;
  }

  function handlePaginationClick(event) {
    const target = event.target;

    if (target.tagName === 'BUTTON') {
      const page = target.getAttribute('data-page');
      if (page) {
        offset = (page - 1) * paginationLimit;
        displayPokemonList();
      } else if (target.id === 'prevPage') {
        offset = Math.max(0, offset - paginationLimit);
        displayPokemonList();
      } else if (target.id === 'nextPage') {
        offset += paginationLimit;
        displayPokemonList();
      }
    }
  }

  $paginationContainer.addEventListener('click', handlePaginationClick);

  async function updatePagination() {
    const { count } = await fetchPokemons();
    const totalPages = Math.ceil(count / paginationLimit);
    const currentPage = offset / paginationLimit + 1;

    createPaginationButtons(totalPages, currentPage);
  }

  function createPokemonCard(pokemon) {
    return `
    <li class="pokemonCard ${pokemon.types[0]}" data-pokemon-id=${pokemon.id}>
      <figure class="pokemonImage">
        <img src="${pokemon.image}" alt="${pokemon.name}" />
      </figure>
      <article class="pokemonInfoContainer">
        <div class="pokemonInfo">
          <span class="pokemonName">${pokemon.name}</span>
          <span class="pokemonNumber">#${Number(pokemon.id)
            .toString()
            .padStart(3, '0')}</span>
        </div>
        <div class="pokemonTypes">
          ${pokemon.types
            .map((type) => `<span class="pokemonType ${type}">${type}</span>`)
            .join('')}
        </div>
      </article>
      <article class="pokemonStats">
        ${pokemon.stats
          .map(
            (stat) => `
          <div class="statsRow">
            <span class="statLabel">${stat.name}</span>
            <div class="statBar">
              <div class="statBarBg" style="width: ${
                (100 * stat.value) / 250
              }%"">
                <span class="statValue">${stat.value}</span>
              </div>
            </div>
          </div>`
          )
          .join('')}
      </article>
    </li>
  `;
  }
  window.addEventListener('popstate', function (event) {
    if (event.state) {
      offset = event.state.offset;
      displayPokemonList();
    }
  });

  displayPokemonList();
})();
