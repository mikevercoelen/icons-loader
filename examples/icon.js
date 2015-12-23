import React, { Component, PropTypes } from 'react'

import styles from './icon.scss'

import * as icons from 'icons'

export default class Icon extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }

  render () {
    let icon = icons[this.props.name]

    if (icon === undefined) {
      console.warn('Unknown icon: ' + icon)
      return
    }

    return (
      <span
        className={styles.icon}
        style={
          fontFamily: icon.fontName
        }>
        {icon.unicode}
      </span>
    )
  }
}
