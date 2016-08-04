function save_options() {
  let repetitionListening = document.getElementById('repetition').checked;
  chrome.storage.sync.set({
    repetitionListening: repetitionListening
  }, function() {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  // Use default value repetitionListening = true.
  chrome.storage.sync.get({
    repetitionListening: false
  }, function(items) {
    document.getElementById('repetition').checked = items.repetitionListening;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
