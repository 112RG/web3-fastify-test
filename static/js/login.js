
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn)
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState !== 'loading') { fn() }
    })
  }
}
async function test(e) {
  // Setup web3
  const web3 = new Web3(ethereum)
  ethereum.enable()
  // getting address from which we will sign message
  const address = (await web3.eth.getAccounts())[0]

  const nonce = await (await fetch(`/api/auth/publicNonce?publicAddress=${address}`)).text()

  // generating a token with 1 day of expiration time
  const token = await web3.eth.personal.sign(nonce, address)

  // Post to the ethLogin endpoint
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/auth/ethLogin', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    signature: token,
    publicAddress: address
  }))
}
function login(e) {
  e.preventDefault()

  const status = document.getElementById('status')
  const formData = new FormData(e.target)
  const request = new XMLHttpRequest()

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      status.innerHTML = "<div class='alert alert-success'>" + JSON.parse(this.responseText).message + '</div>'
      status.style.display = 'block'
      window.location = '/user/upload'
    } else if (request.readyState === 4) {
      status.innerHTML = "<div class='alert alert-danger'>" + JSON.parse(this.responseText).message + '</div>'
      status.style.display = 'block'
    }
  }
  request.open('post', '/api/user/login')
  request.send(formData)
}

window.ready(async function () {
  document.querySelector('form').addEventListener('submit', (e) => {
    login(e)
  })
  document.getElementById('meta').addEventListener('click', (e) => {
    test(e)
  })
})
