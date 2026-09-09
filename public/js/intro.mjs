// Starting intro animation module for Huy Phan portfolio
// Features: Character pushing black curtain wall to reveal giant red "HUY PHAN" serif typography

export function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  const urlParams = new URLSearchParams(window.location.search);
  const isForced = urlParams.has("intro");
  const alreadySeen = sessionStorage.getItem("huyml_intro_played") === "1";

  if (alreadySeen && !isForced) {
    overlay.remove();
    return;
  }

  document.body.classList.add("intro-locked");

  let hasStarted = false;

  function runPushSequence() {
    if (hasStarted) return;
    hasStarted = true;

    // Small delay so frame 0 (solid black curtain) is painted
    setTimeout(() => {
      overlay.classList.add("is-running");

      // Curtain reaches 100vw after 2.0s
      setTimeout(() => {
        overlay.classList.add("is-curtain-done");

        // Hold on red HUY PHAN display text for 700ms, then fade out
        setTimeout(() => {
          overlay.classList.add("is-leaving");

          setTimeout(() => {
            overlay.classList.add("is-done");
            document.body.classList.remove("intro-locked");
            sessionStorage.setItem("huyml_intro_played", "1");
            window.dispatchEvent(new CustomEvent("huyml:intro-complete"));
          }, 600);
        }, 700);
      }, 2000);
    }, 120);
  }

  runPushSequence();

  // Allow clicking anywhere to skip intro
  overlay.addEventListener("click", () => {
    overlay.classList.add("is-leaving");
    setTimeout(() => {
      overlay.classList.add("is-done");
      document.body.classList.remove("intro-locked");
      sessionStorage.setItem("huyml_intro_played", "1");
    }, 300);
  });
}
