import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../../context'
import { Drawer } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button } from '../components/elements'

import Web3 from 'web3'
// import axios from 'axios'

import { message } from 'antd';

// import logo from '../../assets/spartan-logo-white.png';

import WalletDrawer from '../layout/WalletDrawer'
import { getAddressShort, } from '../../utils'
import {
    getTokenDetails, getListedTokens,
    getWalletData, getStakesData, getListedPools
} from '../../client/web3'

const AddressConn = (props) => {

    const context = useContext(Context)
    const [connecting, setConnecting] = useState(false)
    const [connected, setConnected] = useState(false)
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        connectWallet()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const connectWallet = async () => {
        setConnecting(true)
        window.web3 = new Web3(window.ethereum);
        const account = (await window.web3.eth.getAccounts())[0];
        if (account) {
            message.loading('Loading tokens', 3);
            // let assetArray = context.assetArray ? context.assetArray : await getAssets()
            // context.setContext({ 'assetArray': assetArray })
            // let assetDetailsArray = context.assetDetailsArray ? context.assetDetailsArray : await getTokenDetails(account, assetArray)
            // context.setContext({ 'assetDetailsArray': assetDetailsArray })

            let tokenArray = context.tokenArray ? context.tokenArray : await getListedTokens()
            context.setContext({ 'tokenArray': tokenArray })
            // context.setContext({ 'poolsData': await getPoolsData(tokenArray) })

            // let allTokens = assetArray.concat(tokenArray)
            // var sortedTokens = [...new Set(allTokens)].sort()

            let tokenDetailsArray = context.tokenDetailsArray ? context.tokenDetailsArray : await getTokenDetails(account, tokenArray)
            context.setContext({ 'tokenDetailsArray': tokenDetailsArray })

            message.loading('Loading wallet data', 3);
            let walletData = await getWalletData(account, tokenDetailsArray)
            context.setContext({ 'walletData': walletData })

            let poolArray = context.poolArray ? context.poolArray : await getListedPools()
            context.setContext({ 'poolArray': poolArray })

            let stakesData = context.stakesData ? context.stakesData : await getStakesData(account, tokenArray)
            context.setContext({ 'stakesData': stakesData })

            context.setContext({ 'connected': true })
            await getSpartaPrice()
            setConnecting(false)
            setConnected(true)
            message.success('Loaded!', 2);
        } else {
            await ethEnabled()
            setConnected(false)
        }
    }

    const ethEnabled = () => {
        console.log('connecting')
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
            setConnecting(true)
            return true;
        }
        return false;
    }

    const getSpartaPrice = async () => {
        // let resp = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=spartan&vs_currencies=usd')
        // console.log(resp.data.spartan.usd)
        // context.setContext({ 'spartanPrice': resp.data.spartan.usd })
        context.setContext({ 'spartanPrice': 0.3 })
        return
    }

    const addr = () => {
        return getAddressShort(context.walletData?.address)
    }

    const showDrawer = () => {
        setVisible(true);
    };
    const onClose = () => {
        setVisible(false);
    };

    return (
      <div>
        {!connected && !connecting &&
            <Button type="primary" onClick={connectWallet}>CONNECT</Button>
        }
        {connecting &&
            <Button type="primary" icon={<LoadingOutlined />}>CONNECTING</Button>
        }
        {connected &&
            <Button type="primary" icon={<UserOutlined />} onClick={showDrawer}>{addr()}</Button>
        }

        <Drawer
            title={context.walletData?.address}
            placement="right"
            closable={false}
            onClose={onClose}
            visible={visible}
            width={350}
        >
            <WalletDrawer />
        </Drawer>
      </div>

    )
}

export default AddressConn
