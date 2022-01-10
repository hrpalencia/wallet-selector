import React, { useState } from "react";
import styles from "./Modal.styles";
import modalHelper from "../../ModalHelper";
import State from "../../../state/State";
import ILedgerWallet from "../../../interfaces/ILedgerWallet";

function Modal(): JSX.Element {
  const [ledgerDerivationPath] = useState("44'/397'/0'/0'/0'");
  const [ledgerCustomDerivationPath, setLedgerCustomDerivationPath] = useState("44'/397'/0'/0'/0'");
  const [ledgerWalletError, setLedgerWalletError] = useState("");
  const [useCustomDerivationPath, setUseCustomDerivationPath] = useState(false);
  const [walletInfoVisible, setWalletInfoVisible] = useState(false);
  const defaultDescription = "Please select a wallet to connect to this dapp:";

  const mountedStyle = {
    animation: "inAnimation 350ms ease-in",
    maxHeight: "300px",
  };
  const unmountedStyle = {
    animation: "outAnimation 200ms ease-out",
    animationFillMode: "forwards",
  };

  function handleCloseModal(event: any) {
    event.preventDefault();
    if (event.target === event.currentTarget) onCloseModalHandler();
  }

  function onCloseModalHandler() {
    modalHelper.hideModal();
    setUseCustomDerivationPath(false);
    setLedgerCustomDerivationPath("44'/397'/0'/0'/0'");
    setLedgerWalletError("");
    setWalletInfoVisible(false);
  }

  function getThemeClass(theme: string | null) {
    let themeClass = "";
    switch (theme) {
      case "dark":
        themeClass = "Modal-dark-theme";
        break;
      case "light":
        themeClass = "Modal-light-theme";
        break;
      default:
        themeClass = "";
        break;
    }
    return themeClass;
  }

  function onUseCustomPathHandler() {
    setUseCustomDerivationPath(true);
  }

  function onUseDefaultDerivationPathHandler() {
    setUseCustomDerivationPath(false);
    setLedgerWalletError("");
  }

  function onCustomDerivationPathChangeHandler(event: any) {
    setLedgerCustomDerivationPath(event.target.value);
  }

  return (
    <div>
      <style>{styles}</style>
      <div className={`Modal ${getThemeClass(State.options.theme)}`} onClick={handleCloseModal}>
        <div className="Modal-content">
          <div className="Modal-body Modal-select-wallet-option">
            <p>{State.options.walletSelectorUI.description || defaultDescription}</p>
            <ul className="Modal-option-list">
              {State.options.wallets.map((wallet: string) => {
                if (!State.walletProviders[wallet] || !State.walletProviders[wallet].getShowWallet()) return null;
                return (
                  <li
                    key={State.walletProviders[wallet].getName()}
                    onClick={() => {
                      State.walletProviders[wallet].walletSelected();
                    }}
                  >
                    <div title={State.walletProviders[wallet].getDescription()}>
                      <img
                        src={State.walletProviders[wallet].getIcon()}
                        alt={State.walletProviders[wallet].getName()}
                      />
                      <span>{State.walletProviders[wallet].getName()}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="Modal-body Modal-choose-ledger-derivation-path">
            <p>Make sure your Ledger is plugged in, then select a derivation path to connect your accounts:</p>
            <div className="derivation-paths-list">
              <button
                className={!useCustomDerivationPath ? "path-option-highlighted" : ""}
                onClick={onUseDefaultDerivationPathHandler}
              >
                NEAR - 44'/397'/0'/0'/0'
              </button>
              {!useCustomDerivationPath && (
                <button
                  className={useCustomDerivationPath ? "path-option-highlighted" : ""}
                  onClick={onUseCustomPathHandler}
                >
                  Custom Path
                </button>
              )}
              {useCustomDerivationPath && (
                <input
                  className={ledgerWalletError ? "input-error" : ""}
                  type="text"
                  placeholder="custom derivation path"
                  value={ledgerCustomDerivationPath}
                  onChange={onCustomDerivationPathChangeHandler}
                />
              )}
              {ledgerWalletError && <p className="error">{ledgerWalletError}</p>}
            </div>
            <div className="derivation-paths--actions">
              <button className="dismiss" onClick={onCloseModalHandler}>
                Dismiss
              </button>
              <button
                className="connect"
                onClick={async () => {
                  let derivationPath = ledgerDerivationPath;
                  if (useCustomDerivationPath) {
                    derivationPath = ledgerCustomDerivationPath;
                  }

                  try {
                    const ledgerWalletProvider = State.walletProviders["ledgerwallet"] as ILedgerWallet;
                    ledgerWalletProvider.setDerivationPath(derivationPath);
                    await ledgerWalletProvider.connect();
                  } catch (e) {
                    setLedgerWalletError(`Error: ${e.message}`);
                  }
                }}
              >
                Connect
              </button>
            </div>
          </div>
          <div className="Modal-body Modal-wallet-not-installed">
            <div className="icon-display">
              <img src="https://senderwallet.io/logo.png" alt="Sender Wallet" />
              <p>SenderWallet</p>
            </div>
            <p>
              You'll need to install SenderWallet to continue. After installing
              <span
                className="refresh-link"
                onClick={() => {
                  window.location.reload();
                }}
              >
                &nbsp;refresh the page.
              </span>
            </p>
            <div className="action-buttons">
              <button
                className="back"
                onClick={() => {
                  modalHelper.hideSenderWalletNotInstalledMessage();
                  modalHelper.openSelectWalletOptionModal();
                }}
              >
                Back
              </button>
              <button
                className="download"
                onClick={() => {
                  window.open(
                    "https://chrome.google.com/webstore/detail/sender-wallet/epapihdplajcdnnkdeiahlgigofloibg",
                    "_blank"
                  );
                }}
              >
                Open SenderWallet
              </button>
            </div>
          </div>
          {State.options.walletSelectorUI.explanation && (
            <div className="info">
              <span
                onClick={() => {
                  setWalletInfoVisible(!walletInfoVisible);
                }}
              >
                What is a Wallet?
              </span>
              <div className="info-description" style={walletInfoVisible ? mountedStyle : unmountedStyle}>
                <p>{State.options.walletSelectorUI.explanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;