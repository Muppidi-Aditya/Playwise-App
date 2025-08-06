import React, { Component } from 'react';
import './style.css'
import FooterMenuContext from '../../FooterMenuContext';

import { AiFillHome, AiOutlineSearch, AiFillHeart } from "react-icons/ai";

class FooterMenu extends Component {
    static contextType = FooterMenuContext;

    moveFooterMenuTab = (tab) => {
        this.context.setFooterMenuTab(tab);
    };

    getMovingBlockStyle = () => {
        // Get the current tab from context instead of local state
        const { footerMenuTab } = this.context;
        switch (footerMenuTab) {
            case 'home':
                return { left: '5px' };
            case 'search':
                return { left: 'calc(50% - 32.5px)' };
            case 'heart':
                return { left: 'calc(100% - 70px)' };
            default:
                return { left: '5px' }; // Default to home position
        }
    };

    render() {
        const { footerMenuTab } = this.context;

        return (
            <div className='footer-menu'>
                <div className='footer-menu-block'>
                    <AiFillHome 
                        className={`footer-menu-icon ${footerMenuTab === 'home' ? 'active' : ''}`}
                        onClick={() => this.moveFooterMenuTab('home')} 
                    />
                </div>
                <div className='footer-menu-block'>
                    <AiOutlineSearch 
                        className={`footer-menu-icon ${footerMenuTab === 'search' ? 'active' : ''}`}
                        onClick={() => this.moveFooterMenuTab('search')} 
                    />
                </div>
                <div className='footer-menu-block'>
                    <AiFillHeart 
                        className={`footer-menu-icon ${footerMenuTab === 'heart' ? 'active' : ''}`}
                        onClick={() => this.moveFooterMenuTab('heart')} 
                    />
                </div>
                <div 
                    className='footer-menu-moving-block' 
                    style={this.getMovingBlockStyle()}
                ></div>
            </div>
        );
    }
}

export default FooterMenu;